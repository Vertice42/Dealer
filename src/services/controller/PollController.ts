import { PollButton } from "../models/poll/PollButton";

import { reject, resolve, Promise } from "bluebird";

import { Bet } from "../models/poll/dbBets";

import { PollStatus } from "../models/poll/PollStatus";

import { Poll } from "../models/poll/Poll";
import { PollBet } from "../models/poll/PollBeat";
import UpdateButtonGroupResult from "../models/poll/UpdateButtonGroupResult";
import { DistributionCalculationResult, StatisticsOfDistribution } from "../models/poll/DistributionCalculationResult";
import { dbPollManager } from "../modules/databaseManager/poll/dbPollManager";
import { dbWalletManager } from "../modules/databaseManager/wallet/dbWalletManager";
import dbManager from "../modules/databaseManager/dbManager";
import { sleep } from "../utils/functions";

/**
* Calculation of the distribution of winnings used in the list of bets and options
* or options shipped
* 
* @param Bets 
* @param WinningButtons 
* 
*/
function CalculateDistribution(Bets: Bet[], WinningButtons: PollButton[]) {
    let NumberOfLosers = 0
    let NumberOfWinners = 0;
    let Lost = 0;
    let Won = 0;

    Bets.forEach(Bets => {
        if (Bets.BetAmount) {
            if (dbPollManager.BetIsWinner(WinningButtons, Bets.Bet)) {
                NumberOfWinners++;
                Won += Bets.BetAmount;
            } else {
                NumberOfLosers++;
                Lost += Bets.BetAmount;
            }
        }
    });

    return new DistributionCalculationResult(NumberOfLosers, NumberOfWinners, Lost, Won)
}

export default class PollController {
    public StreamerID: string;
    private StopDistributions = false;
    OnDistributionsEnd = (StatisticsOfDistribution: StatisticsOfDistribution) => { };

    /**
     * 
     * @param Buttons 
     */
    async startDistributions(Buttons: PollButton[]) {
        this.StopDistributions = false;
        let StartTime = new Date().getTime();

        let WinningButtons = dbPollManager.getWinningButtons(Buttons);

        let Bets = await new dbPollManager(this.StreamerID).getAllBetsOfCurrentPoll();

        if (Bets.length < 1) throw { DistributionStartedError: 'insufficient number of bets' };

        let DistributionCalculationResult = CalculateDistribution(Bets, WinningButtons);

        let DistributionPromises = [];

        for (const Bet of Bets) {
            if (this.StopDistributions) throw 'Distribution Stopped';
            if (Bet) {
                let walletManager = new dbWalletManager(this.StreamerID, Bet.TwitchUserID);
                if (dbPollManager.BetIsWinner(WinningButtons, Bet.Bet))
                    DistributionPromises.push(walletManager.deposit
                        (Bet.BetAmount * DistributionCalculationResult.EarningsDistributor))
            }
        };

        Promise.all(DistributionPromises)
            .catch((error) => {
                if (error === 'Error in distribution') {
                    this.OnDistributionsEnd(new StatisticsOfDistribution(
                        DistributionCalculationResult, error, StartTime, true));
                }
            })
            .then(async () => {
                this.OnDistributionsEnd(new StatisticsOfDistribution(
                    DistributionCalculationResult, 'Destruction done successfully', StartTime));
            })

        return resolve({ DistributionStarted: new Date() });

    }
    async stopDistributions() {
        this.StopDistributions = true;
    }
    /**
     * 
     * @param TwitchUserName 
     * @param ChosenOppositeID 
     * @param NewBetAmount 
     */
    async AddBet(TwitchUserName: string, ChosenBetID: number, NewBetAmount: number) {
        let WalletManager = new dbWalletManager(this.StreamerID, TwitchUserName);
        let UserWallet = await WalletManager.getWallet();

        let db_pollManager = new dbPollManager(this.StreamerID);

        let dbBet = await db_pollManager.get_dbBet(TwitchUserName);

        if (dbBet) {
            if (dbBet.BetAmount !== NewBetAmount) {

                if (NewBetAmount > UserWallet.Coins + dbBet.BetAmount) {
                    throw {
                        RequestError: {
                            InsufficientFunds: {
                                BetAmount: NewBetAmount,
                                Coins: UserWallet.Coins
                            }
                        }
                    };
                }

                let DifferenceBetweenBets = dbBet.BetAmount - NewBetAmount;
                if (DifferenceBetweenBets > 0) {
                    await WalletManager.deposit(DifferenceBetweenBets);
                } else {
                    await WalletManager.withdraw(DifferenceBetweenBets);
                }
            }
            await db_pollManager.updateBet(dbBet, new Bet(TwitchUserName, ChosenBetID, NewBetAmount));

        } else {

            if (UserWallet.Coins < NewBetAmount) {
                throw {
                    RequestError: {
                        InsufficientFunds: {
                            BetAmount: NewBetAmount,
                            Coins: UserWallet.Coins
                        }
                    }
                }
            }

            await WalletManager.withdraw(NewBetAmount);
            await db_pollManager.createBet(new Bet(TwitchUserName, ChosenBetID, NewBetAmount));
        }

        return resolve({ BetAccepted: { Bet: NewBetAmount } });

    }
    /**
     * 
     * @param Buttons 
     */
    async UpdateButtonsOfPoll(Buttons: PollButton[]) {
        /** The button update occurs according to the information received,
         * the modified buttons are updated, the buttons that do not exist
         * in the database are added, if a button was not sent but exists
         * in the database it is deleted.
         */

        let db_pollManager = new dbPollManager(this.StreamerID);

        let UpdateOrCreateResult = await db_pollManager.UpdateOrCreateButtonsOfPoll(Buttons);
        let DeleteResult = await db_pollManager.DeleteButtonsThatAreNotIn_db(Buttons);

        return new UpdateButtonGroupResult(
            UpdateOrCreateResult.CreatedButtons,
            UpdateOrCreateResult.UpdatedButtons,
            DeleteResult.DeletedButtons)

    }
    async UpdatePollStatus(PollStatus: PollStatus) {
        let dbManager = new dbPollManager(this.StreamerID);

        if (PollStatus.PollWaxed && !PollStatus.DistributionCompleted) {
            let ReturnPromises = [];
            (await dbManager.getAllBetsOfCurrentPoll()).forEach(bet => {
                ReturnPromises.push(new dbWalletManager(this.StreamerID, bet.TwitchUserID)
                    .deposit(bet.BetAmount))
            });
            await Promise.all(ReturnPromises);
        }
        return dbManager.updatePollStatus(PollStatus);
    }
    async CreatePoll(PollStatus: PollStatus): Promise<any> {
        /**Generate a handle with the current time
         * to create the tables
         */
        await new dbPollManager(this.StreamerID).createPollIndex(PollStatus);
        return resolve({ PollCreated: new Date });
    }
    async UpdatePoll(PollStatus: PollStatus, Buttons: PollButton[]) {
        let Promises = [];
        if (PollStatus) Promises.push(this.UpdatePollStatus(PollStatus));
        if (Buttons) Promises.push(this.UpdateButtonsOfPoll(Buttons));
        return Promise.all(Promises);
    }

    async getCurrentPollStatus(db_pollManager = new dbPollManager(this.StreamerID)) {
        return new PollStatus(await db_pollManager.getLastPollStatus());
    }
    /**
     * Returns the most recent poll in the database if there is one, otherwise it returns a poll 
     * with the status of 'WAXED'
     * @returns Poll
     */
    async getCurrentPoll() {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        if (!AccountData) throw { code: 400, message: 'Extension not initiated by the Streamer' };

        let Buttons = [];
        let Bets: PollBet[];

        let db_pollManager = new dbPollManager(this.StreamerID);

        let PollStatus: PollStatus = await this.getCurrentPollStatus();

        for (const dbButton of await db_pollManager.getAllButtonsOfCurrentPoll()) {
            Buttons.push(new PollButton(
                dbButton.ID,
                dbButton.Name,
                dbButton.Color,
                dbButton.IsWinner))
        }

        Bets = await db_pollManager.getNumberOfBets();

        return resolve(new Poll(
            PollStatus,
            Buttons,
            Bets));
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
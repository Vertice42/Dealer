import { PollButton } from "../models/poll/PollButton";

import { POLL_WAXED, NOT_IN_STRING, POLL_STOPPED, POLL_STARTED, dbManager } from "../modules/database/dbManager";

import { dbWalletManager } from "../modules/database/wallet/dbWalletManager";

import { reject, resolve } from "bluebird";

import { RenameTable } from "../modules/database/dbUtil";

import { Define } from "../modules/database/dbDefine";

import { ButtonDefiner } from "../models/poll/dbButton";

import { BettingDefiner, Bet } from "../models/poll/dbBetting";

import { PollStatus } from "../models/poll/PollStatus";

import { Poll } from "../models/poll/Poll";
import UpdateButtonGroupResult from "../models/poll/UpdateButtonGroupResult";
import { PollBeat } from "../models/poll/PollBeat";
import { dbPollManager } from "../modules/database/poll/dbPollManager";
import { dbBeatingsManager } from "../modules/database/poll/dbBettingsManager";

export class PollController {
    public StreamerID: string;
    private StopDistributions = false;

    OnDistributionsEnd = (StatisticsOfDistribution: {}) => { };

    /**
     * 
     * @param StreamerID 
     */
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    /**
     * 
     * @param Buttons 
     */
    async startDistributions(Buttons: PollButton[]) {
        this.StopDistributions = false;
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let StartTime = new Date().getTime();

        let WinningButtons = dbPollManager.getWinningButtons(Buttons);

        let Betting = await new dbPollManager(this.StreamerID).getAllBeatings();

        if (Betting.length < 2) return reject({ DistributionStartedError: 'insufficient number of bets' })

        let AccountResult = dbPollManager.CalculateDistribution(Betting, WinningButtons);

        AccountData.LossDistributor = AccountResult.LossDistributor;

        let DistributionPromises = [];

        Betting.forEach(async Betting => {
            if (this.StopDistributions) throw 'DistributionsAsStopped';
            if (Betting) {
                let walletManager = new dbWalletManager(this.StreamerID, Betting.TwitchUserID);

                if (dbPollManager.BetIsWinner(WinningButtons, Betting.Bet))
                    DistributionPromises.push(walletManager.deposit(Betting.BetAmount * AccountData.LossDistributor))
            }
        });


        Promise.all(DistributionPromises)
            .catch((error) => {
                if (error === 'DistributionsAsStopped') {
                    this.OnDistributionsEnd({
                        AccountResult: AccountResult,
                        message:'DistributionsAsStopped',
                        timeOfDistribution: new Date().getTime() - StartTime + ' ms'
                    });
                }
            })
            .then(() => {
                this.OnDistributionsEnd({
                    AccountResult: AccountResult,
                    timeOfDistribution: new Date().getTime() - StartTime + ' ms'
                });
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
     * @param newBetAmount 
     */
    async AddBet(TwitchUserName: string, ChosenBetID: number, newBetAmount: number) {
        let BetsManager = new dbBeatingsManager(this.StreamerID);
        let WalletManager = new dbWalletManager(this.StreamerID, TwitchUserName);
        let UserWallet = await WalletManager.getWallet();

        let dbBet = await BetsManager.get_dbBet(TwitchUserName);

        if (dbBet) {
            if (dbBet.BetAmount !== newBetAmount) {
                let DifferenceBetweenBets = dbBet.BetAmount - newBetAmount;

                if (UserWallet.Coins < newBetAmount) {
                    return reject({
                        RequestError: {
                            InsufficientFunds: {
                                BetAmount: newBetAmount,
                                Coins: UserWallet.Coins
                            }
                        }
                    });
                }

                if (DifferenceBetweenBets > 0) {
                    await WalletManager.deposit(DifferenceBetweenBets);

                } else {
                    await WalletManager.withdraw(DifferenceBetweenBets);
                }
            }
            await BetsManager.updateBet(dbBet, new Bet(TwitchUserName, ChosenBetID, newBetAmount));

        } else {

            if (UserWallet.Coins < newBetAmount) {
                return reject({
                    RequestError: {
                        InsufficientFunds: {
                            BetAmount: newBetAmount,
                            Coins: UserWallet.Coins
                        }
                    }
                });
            }

            await WalletManager.withdraw(newBetAmount);
            await BetsManager.createBet(new Bet(TwitchUserName, ChosenBetID, newBetAmount));
        }

        return resolve({ BetAccepted: { Bet: newBetAmount } });

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
            DeleteResult.DeletedButtons
        );
    }
    /**
     * @returns {CurrentPollStatus:PollStatus}
     */
    async dbUpdatePollStatus(): Promise<PollStatus> {
        let AccountData = dbManager.getAccountData(this.StreamerID);

        if (!AccountData.CurrentPollID)
            return resolve(AccountData.CurrentPollStatus);

        let NewCurrentPollID = AccountData.CurrentPollID;
        let NewCurrentBeatingsID = AccountData.CurrentBettingID;

        if (AccountData.CurrentPollStatus.PollWaxed) {
            if (AccountData.CurrentPollID.indexOf(POLL_WAXED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_WAXED;
            if (AccountData.CurrentBettingID.indexOf(POLL_WAXED) === NOT_IN_STRING)
                NewCurrentBeatingsID += POLL_WAXED;
        }
        if (AccountData.CurrentPollStatus.PollStopped) {
            if (AccountData.CurrentPollID.indexOf(POLL_STOPPED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_STOPPED;
            if (AccountData.CurrentBettingID.indexOf(POLL_STOPPED) === NOT_IN_STRING)
                NewCurrentBeatingsID += POLL_STOPPED;
        }
        else {
            NewCurrentPollID = NewCurrentPollID.replace(POLL_STOPPED, "");
            NewCurrentBeatingsID = NewCurrentBeatingsID.replace(POLL_STOPPED, "");
        }
        if (AccountData.CurrentPollStatus.PollStarted) {
            if (AccountData.CurrentPollID.indexOf(POLL_STARTED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_STARTED;
            if (AccountData.CurrentBettingID.indexOf(POLL_STARTED) === NOT_IN_STRING)
                NewCurrentBeatingsID += POLL_STARTED;
        }

        if (AccountData.CurrentPollID !== NewCurrentPollID &&
            AccountData.CurrentBettingID !== NewCurrentBeatingsID) {

            await RenameTable(AccountData.dbStreamer, AccountData.CurrentPollID, NewCurrentPollID);
            await RenameTable(AccountData.dbStreamer, AccountData.CurrentBettingID, NewCurrentBeatingsID);

            AccountData.CurrentPollID = NewCurrentPollID;
            AccountData.CurrentBettingID = NewCurrentBeatingsID;

            await Define.CurrentPollButtons(AccountData);
            await Define.CurrentBetting(AccountData);

        }
        return resolve(AccountData.CurrentPollStatus);
    }
    /**
     * @param Buttons 
     * @returns {UpdatePollStatusRes:PollStatus, UpdateButtonGroupRes:UpdateButtonGroupResult}
     */
    async UpdatePoll(Buttons: PollButton[]): Promise<any> {
        let AccountData = dbManager.getAccountData(this.StreamerID);

        let UpdatePollStatusRes: PollStatus = null;
        let UpdateButtonGroupRes: UpdateButtonGroupResult = null;

        if (AccountData.CurrentPollStatus)
            UpdatePollStatusRes = await this.dbUpdatePollStatus();            

        if (Buttons && Buttons.length > 0)
            UpdateButtonGroupRes = await this.UpdateButtonsOfPoll(Buttons);

        AccountData.LastUpdate = new Date().getTime();

        return { UpdatePollStatusRes, UpdateButtonGroupRes };
    }
    /**
     * @returns { PollCreated: new Date }
     */
    async CreatePoll(): Promise<any> {
        /**Generate a handle with the current time
         * to create the tables
         */
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let ID = new Date().getTime();
        AccountData.CurrentPollID = ID + ButtonDefiner.tableName;
        AccountData.CurrentBettingID = ID + BettingDefiner.TableName;
        AccountData.CurrentPollStatus = new PollStatus();
        await Define.CurrentPollButtons(AccountData);
        await Define.CurrentBetting(AccountData);

        AccountData.LastUpdate = new Date().getTime();

        return resolve({ PollCreated: new Date });
    }
    /**
     * Returns the most recent poll in the database if there is one, otherwise it returns a poll 
     * with the status of 'WAXED'
     * @returns Poll
     */
    async getCurrentPoll() {
        let AccountData = dbManager.getAccountData(this.StreamerID);

        let Buttons = [];
        let Bets: PollBeat[];

        let db_pollManager = new dbPollManager(this.StreamerID);

        for (const dbButton of await db_pollManager.getAllButtonsOfCurrentPoll()) {
            Buttons.push(new PollButton(
                dbButton.ID,
                dbButton.Name,
                dbButton.Color,
                dbButton.IsWinner))
        }

        Bets = await db_pollManager.getBeatsOfCurrentPoll();

        return resolve(new Poll(
            AccountData.CurrentPollStatus,
            Buttons, AccountData.LossDistributor,
            AccountData.LastUpdate,
            Bets));
    }
}
import { PollButton } from "../models/poll/PollButton";

import { POLL_WAXED, NOT_IN_STRING, POLL_STOPED, POLL_STARTED, dbManager } from "../modules/database/dbManager";

import { dbWalletManeger } from "../modules/database/wallet/dbWalletManager";

import { reject, resolve } from "bluebird";

import { RenameTable } from "../modules/database/dbUtil";

import { Define } from "../modules/database/dbDefine";

import { ButtonDefiner } from "../models/poll/dbButton";

import { BettingsDefiner, Bet } from "../models/poll/dbBettings";

import { PollStatus } from "../models/poll/PollStatus";

import { Poll } from "../models/poll/Poll";
import UpdateButtonGroupResult from "../models/poll/UpdateButtonGroupResult";
import { PollBeat } from "../models/poll/PollBeat";
import { dbPollMager } from "../modules/database/poll/dbPollManager";
import IOListeners from "../IOListeners";
import { getSoketOfStreamer } from "../SocketsManager";
import { dbBettingsManager } from "../modules/database/poll/dbBettingsManager";
import { AccountData } from "../models/dealer/AccountData";
import { throws } from "assert";

export class PollController {
    public StreamerID: string;
    private StopDistribuition = false;

    OnDistribuitionEnd = (StatisticsOfDistribution: {}) => { };

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
    async startDistribuition(Buttons: PollButton[]) {
        this.StopDistribuition = false;
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let StartTime = new Date().getTime();

        let WinningButtons = dbPollMager.getWinningButtons(Buttons);

        let Bettings = await new dbPollMager(this.StreamerID).getAllBettings();

        if (Bettings.length < 2) return reject({ DistributionStartedError: 'insufficient number of bets' })

        let AccontResult = dbPollMager.CalculateDistribution(Bettings, WinningButtons);

        AccountData.LossDistributor = AccontResult.LossDistributor;

        let DistributionPromises = [];

        Bettings.forEach(async Betting => {
            if (this.StopDistribuition) throw 'DistribuitionAsStoped';
            if (Betting) {
                let walletManeger = new dbWalletManeger(this.StreamerID, Betting.TwitchUserID);

                if (dbPollMager.BetIsWinner(WinningButtons, Betting.Bet))
                    DistributionPromises.push(walletManeger.deposit(Betting.BetAmount * AccountData.LossDistributor))
            }
        });


        Promise.all(DistributionPromises)
            .catch((erro) => {
                if (erro === 'DistribuitionAsStoped') {
                    this.OnDistribuitionEnd({
                        AccontResult,
                        message:'DistribuitionAsStoped',
                        timeOfDistribution: new Date().getTime() - StartTime + ' ms'
                    });
                }
            })
            .then(() => {
                this.OnDistribuitionEnd({
                    AccontResult,
                    timeOfDistribution: new Date().getTime() - StartTime + ' ms'
                });
            })

        return resolve({ DistributionStarted: new Date() });

    }
    async stopDistribuition() {
        this.StopDistribuition = true;
    }
    /**
     * 
     * @param TwitchUserID 
     * @param ChosenOppositeID 
     * @param newBetAmount 
     */
    async AddBet(TwitchUserID: string, ChosenBetID: number, newBetAmount: number) {
        let BetsManager = new dbBettingsManager(this.StreamerID);
        let WalletManager = new dbWalletManeger(this.StreamerID, TwitchUserID);
        let UserWallet = await WalletManager.getWallet();

        let dbBet = await BetsManager.getdbBet(TwitchUserID);

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
            await BetsManager.updateBet(dbBet, new Bet(TwitchUserID, ChosenBetID, newBetAmount));

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
            await BetsManager.createBet(new Bet(TwitchUserID, ChosenBetID, newBetAmount));
        }

        return resolve({ BetAcepted: { Bet: newBetAmount } });

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

        let db_pollMager = new dbPollMager(this.StreamerID);

        let UpdateOrCreateResult = await db_pollMager.UpdateOrCreateButtonsOfPoll(Buttons);
        let DeleteResult = await db_pollMager.DeleteButtonsThatAreNotIndb(Buttons);

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
        let NewCurrentBettingsID = AccountData.CurrentBettingsID;

        if (AccountData.CurrentPollStatus.PollWaxed) {
            if (AccountData.CurrentPollID.indexOf(POLL_WAXED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_WAXED;
            if (AccountData.CurrentBettingsID.indexOf(POLL_WAXED) === NOT_IN_STRING)
                NewCurrentBettingsID += POLL_WAXED;
        }
        if (AccountData.CurrentPollStatus.PollStoped) {
            if (AccountData.CurrentPollID.indexOf(POLL_STOPED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_STOPED;
            if (AccountData.CurrentBettingsID.indexOf(POLL_STOPED) === NOT_IN_STRING)
                NewCurrentBettingsID += POLL_STOPED;
        }
        else {
            NewCurrentPollID = NewCurrentPollID.replace(POLL_STOPED, "");
            NewCurrentBettingsID = NewCurrentBettingsID.replace(POLL_STOPED, "");
        }
        if (AccountData.CurrentPollStatus.PollStarted) {
            if (AccountData.CurrentPollID.indexOf(POLL_STARTED) === NOT_IN_STRING)
                NewCurrentPollID += POLL_STARTED;
            if (AccountData.CurrentBettingsID.indexOf(POLL_STARTED) === NOT_IN_STRING)
                NewCurrentBettingsID += POLL_STARTED;
        }

        if (AccountData.CurrentPollID !== NewCurrentPollID &&
            AccountData.CurrentBettingsID !== NewCurrentBettingsID) {

            await RenameTable(AccountData.dbStreamer, AccountData.CurrentPollID, NewCurrentPollID);
            await RenameTable(AccountData.dbStreamer, AccountData.CurrentBettingsID, NewCurrentBettingsID);

            AccountData.CurrentPollID = NewCurrentPollID;
            AccountData.CurrentBettingsID = NewCurrentBettingsID;

            await Define.CurrentPollButtons(AccountData);
            await Define.CurrentBettings(AccountData);

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
        AccountData.CurrentBettingsID = ID + BettingsDefiner.TableName;
        AccountData.CurrentPollStatus = new PollStatus();
        await Define.CurrentPollButtons(AccountData);
        await Define.CurrentBettings(AccountData);

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

        let db_pollMager = new dbPollMager(this.StreamerID);

        for (const dbButton of await db_pollMager.getAllButtonsOfCurrentPoll()) {
            Buttons.push(new PollButton(
                dbButton.ID,
                dbButton.Name,
                dbButton.Color,
                dbButton.IsWinner))
        }

        Bets = await db_pollMager.getBeatsOfCurrentPoll();

        return resolve(new Poll(
            AccountData.CurrentPollStatus,
            Buttons, AccountData.LossDistributor,
            AccountData.LastUpdate,
            Bets));
    }
}
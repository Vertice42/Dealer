"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PollButton_1 = require("../models/poll/PollButton");
const dbStreamerManager_1 = require("../modules/database/dbStreamerManager");
const dbWalletManager_1 = require("../modules/database/miner/dbWalletManager");
const bluebird_1 = require("bluebird");
const dbUtil_1 = require("../modules/database/dbUtil");
const dbDefine_1 = require("../modules/database/dbDefine");
const dbButton_1 = require("../models/poll/dbButton");
const dbBettings_1 = require("../models/poll/dbBettings");
const PollStatus_1 = require("../models/poll/PollStatus");
const dbLoading_1 = require("../modules/database/dbLoading");
const Poll_1 = require("../models/poll/Poll");
const UpdateButtonGroupResult_1 = require("../models/poll/UpdateButtonGroupResult");
const dbPollManager_1 = require("../modules/database/poll/dbPollManager");
class PollController {
    /**
     *
     * @param StreamerID
     */
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
    }
    /**
     *
     * @param Buttons
     */
    StartDistribuition(Buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            let startTime = new Date().getTime();
            let WinningButtons = dbPollManager_1.dbPollMager.getWinningButtons(Buttons);
            let Bettings = yield new dbPollManager_1.dbPollMager(this.StreamerID).getAllBettings();
            if (Bettings.length < 1) {
                AccountData.CurrentPollStatus.DistributionCompleted = true;
                return bluebird_1.resolve({ DistributionStarted: new Date(), mensage: 'just hear a bet' });
            }
            let AccontResult = dbPollManager_1.dbPollMager.CalculateDistribution(Bettings, WinningButtons);
            AccountData.LossDistributor = AccontResult.LossDistributor;
            let DistributionPromises = [];
            Bettings.forEach((Bettings) => __awaiter(this, void 0, void 0, function* () {
                if (Bettings) {
                    let walletManeger = new dbWalletManager_1.WalletManeger(this.StreamerID, Bettings.TwitchUserID);
                    if (dbPollManager_1.dbPollMager.BetIsWinner(WinningButtons, Bettings.Bet))
                        DistributionPromises.push(walletManeger.deposit(Bettings.BetAmount * AccountData.LossDistributor));
                    else
                        DistributionPromises.push(walletManeger.withdraw(Bettings.BetAmount));
                }
            }));
            Promise.all(DistributionPromises)
                .then(() => {
                AccountData.CurrentPollStatus.DistributionCompleted = true;
                AccountData.CurrentPollStatus.StatisticsOfDistribution = {
                    AccontResult,
                    timeOfDistribution: new Date().getTime() - startTime + ' ms'
                };
            });
            return bluebird_1.resolve({ DistributionStarted: new Date() });
        });
    }
    /**
     *
     * @param TwitchUserID
     * @param BetID
     * @param BetAmount
     */
    AddBet(TwitchUserID, BetID, BetAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            let Wallet = yield new dbWalletManager_1.WalletManeger(this.StreamerID, TwitchUserID).getWallet();
            if (BetAmount > Wallet.Coins)
                return bluebird_1.reject({
                    RequestError: {
                        InsufficientFunds: {
                            BetAmount: BetAmount,
                            Coins: Wallet.Coins
                        }
                    }
                });
            let UpdateRes = yield AccountData.dbCurrentBettings.update({
                Bet: BetID,
                BetAmount: BetAmount
            }, {
                where: { TwitchUserID: TwitchUserID }
            });
            if (UpdateRes[0] == 0)
                yield AccountData.dbCurrentBettings.create({
                    TwitchUserID: TwitchUserID,
                    Bet: BetID,
                    BetAmount: BetAmount
                });
            return bluebird_1.resolve({ BetAcepted: { Bet: BetAmount } });
        });
    }
    /**
     *
     * @param Buttons
     */
    UpdateButtonsOfPoll(Buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            /** The button update occurs according to the information received,
             * the modified buttons are updated, the buttons that do not exist
             * in the database are added, if a button was not sent but exists
             * in the database it is deleted.
             */
            let db_pollMager = new dbPollManager_1.dbPollMager(this.StreamerID);
            let UpdateOrCreateResult = yield db_pollMager.UpdateOrCreateButtonsOfPoll(Buttons);
            let DeleteResult = yield db_pollMager.DeleteButtonsThatAreNotIndb(Buttons);
            return new UpdateButtonGroupResult_1.default(UpdateOrCreateResult.CreatedButtons, UpdateOrCreateResult.UpdatedButtons, DeleteResult.DeletedButtons);
        });
    }
    /**
     * @returns {CurrentPollStatus:PollStatus}
     */
    dbUpdatePollStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            if (!AccountData.CurrentPollID)
                return bluebird_1.resolve(AccountData.CurrentPollStatus);
            let NewCurrentPollID = AccountData.CurrentPollID;
            let NewCurrentBettingsID = AccountData.CurrentBettingsID;
            if (AccountData.CurrentPollStatus.PollWaxed) {
                if (AccountData.CurrentPollID.indexOf(dbStreamerManager_1.POLL_WAXED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentPollID += dbStreamerManager_1.POLL_WAXED;
                if (AccountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_WAXED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentBettingsID += dbStreamerManager_1.POLL_WAXED;
            }
            if (AccountData.CurrentPollStatus.PollStoped) {
                if (AccountData.CurrentPollID.indexOf(dbStreamerManager_1.POLL_STOPED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentPollID += dbStreamerManager_1.POLL_STOPED;
                if (AccountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_STOPED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentBettingsID += dbStreamerManager_1.POLL_STOPED;
            }
            else {
                NewCurrentPollID = NewCurrentPollID.replace(dbStreamerManager_1.POLL_STOPED, "");
                NewCurrentBettingsID = NewCurrentBettingsID.replace(dbStreamerManager_1.POLL_STOPED, "");
            }
            if (AccountData.CurrentPollStatus.PollStarted) {
                if (AccountData.CurrentPollID.indexOf(dbStreamerManager_1.POLL_STARTED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentPollID += dbStreamerManager_1.POLL_STARTED;
                if (AccountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_STARTED) === dbStreamerManager_1.NOT_IN_STRING)
                    NewCurrentBettingsID += dbStreamerManager_1.POLL_STARTED;
            }
            if (AccountData.CurrentPollID !== NewCurrentPollID &&
                AccountData.CurrentBettingsID !== NewCurrentBettingsID) {
                yield dbUtil_1.RenameTable(AccountData.dbStreamer, AccountData.CurrentPollID, NewCurrentPollID);
                yield dbUtil_1.RenameTable(AccountData.dbStreamer, AccountData.CurrentBettingsID, NewCurrentBettingsID);
                AccountData.CurrentPollID = NewCurrentPollID;
                AccountData.CurrentBettingsID = NewCurrentBettingsID;
                yield dbDefine_1.Define.CurrentPoll(AccountData);
                yield dbDefine_1.Define.CurrentBettings(AccountData);
            }
            return bluebird_1.resolve(AccountData.CurrentPollStatus);
        });
    }
    /**
     * @param Buttons
     * @returns {UpdatePollStatusRes:PollStatus, UpdateButtonGroupRes:UpdateButtonGroupResult}
     */
    UpdatePoll(Buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            let UpdatePollStatusRes = null;
            let UpdateButtonGroupRes = null;
            if (AccountData.CurrentPollStatus)
                UpdatePollStatusRes = yield this.dbUpdatePollStatus();
            if (Buttons && Buttons.length > 0)
                UpdateButtonGroupRes = yield this.UpdateButtonsOfPoll(Buttons);
            AccountData.LastUpdate = new Date().getTime();
            return { UpdatePollStatusRes, UpdateButtonGroupRes };
        });
    }
    /**
     * @returns { PollCreated: new Date }
     */
    CreatePoll() {
        return __awaiter(this, void 0, void 0, function* () {
            /**Generate a handle with the current time
             * to create the tables
             */
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            let ID = new Date().getTime();
            AccountData.CurrentPollID = ID + dbButton_1.ButtonDefiner.tableName;
            AccountData.CurrentBettingsID = ID + dbBettings_1.BettingsDefiner.TableName;
            AccountData.CurrentPollStatus = new PollStatus_1.PollStatus();
            yield dbDefine_1.Define.CurrentPoll(AccountData);
            yield dbDefine_1.Define.CurrentBettings(AccountData);
            AccountData.LastUpdate = new Date().getTime();
            return bluebird_1.resolve({ PollCreated: new Date });
        });
    }
    /**
     * Returns the most recent poll in the database if there is one, otherwise it returns a poll
     * with the status of 'WAXED'
     * @returns Poll
     */
    getCurrentPoll() {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            if (!AccountData)
                AccountData = yield dbLoading_1.Loading.StreamerDatabase(this.StreamerID);
            let Buttons = [];
            let Bets;
            let db_pollMager = new dbPollManager_1.dbPollMager(this.StreamerID);
            if (AccountData.dbCurrentPollButtons) {
                for (const dbButton of yield db_pollMager.getAllButtonsOfCurrentPoll()) {
                    Buttons.push(new PollButton_1.PollButton(dbButton.ID, dbButton.Name, dbButton.Color, dbButton.IsWinner));
                }
                Bets = yield db_pollMager.getBeatsOfCurrentPoll();
            }
            return bluebird_1.resolve(new Poll_1.Poll(AccountData.CurrentPollStatus, Buttons, AccountData.LossDistributor, AccountData.LastUpdate, Bets));
        });
    }
}
exports.PollController = PollController;

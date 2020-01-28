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
const bluebird_1 = require("bluebird");
const PollStatus_1 = require("../../models/poll/PollStatus");
const MinerSettings_1 = require("../../models/miner/MinerSettings");
const dbDefine_1 = require("./dbDefine");
const dbStreamerManager_1 = require("./dbStreamerManager");
const AccountData_1 = require("../../models/AccountData");
const dbUtil_1 = require("./dbUtil");
class Loading {
    /**
     * Loads everything needed for all services to work properly
     * @returns AccountData
     * */
    static StreamerDatabase(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dbStreamerManager_1.dbStreamerManager.CreateStreamerDataBase(StreamerID);
            let accountData = dbStreamerManager_1.dbStreamerManager
                .setAccountData(new AccountData_1.AccountData(StreamerID));
            accountData.CurrentPollStatus = new PollStatus_1.PollStatus();
            yield dbDefine_1.Define.Settings(accountData);
            yield dbDefine_1.Define.Wallets(accountData);
            let tables = yield accountData.dbStreamer.query("show tables");
            if (tables[0].length < 3) {
                accountData.CurrentPollStatus.waxe();
                return accountData;
            }
            //If there are only 2 tables in the database, no poll has been created yet
            accountData.CurrentPollID = dbUtil_1.getTableName(tables[0], tables[0].length - 3);
            accountData.CurrentBettingsID = dbUtil_1.getTableName(tables[0], tables[0].length - 4);
            /**
             * The wallet and settings table are in the same database and will always be
             * the first and second index, while the most recent Bettings poll tables will
             * always be the 3rd and 4th index respectively
             */
            if (accountData.CurrentPollID) {
                if (accountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_WAXED) !== dbStreamerManager_1.NOT_IN_STRING)
                    accountData.CurrentPollStatus.PollWaxed = true;
                if (accountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_STARTED) !== dbStreamerManager_1.NOT_IN_STRING)
                    accountData.CurrentPollStatus.PollStarted = true;
                if (accountData.CurrentBettingsID.indexOf(dbStreamerManager_1.POLL_STOPED) !== dbStreamerManager_1.NOT_IN_STRING)
                    accountData.CurrentPollStatus.PollStoped = true;
                yield dbDefine_1.Define.CurrentPoll(accountData);
                yield dbDefine_1.Define.CurrentBettings(accountData);
            }
            return accountData;
        });
    }
    static Settings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            return accountData.dbSettings
                .findOne({ where: { id: 1 } })
                .then((res) => {
                return (res) ? bluebird_1.resolve(res) : bluebird_1.reject(undefined);
            })
                .catch((reject) => __awaiter(this, void 0, void 0, function* () {
                if (!reject) {
                    yield accountData.dbSettings.create();
                    return Loading.Settings(StreamerID);
                }
            }))
                .then((setting) => {
                return accountData.MinerSettings = new MinerSettings_1.MinerSettings(setting.RewardPerMinute);
            });
        });
    }
}
exports.Loading = Loading;

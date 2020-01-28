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
const PollStatus_1 = require("../poll/models/PollStatus");
const MinerSettings_1 = require("../miner/models/MinerSettings");
const Define_1 = require("./Define");
const Streamer_1 = require("./Streamer");
const util_1 = require("./util");
class Loading {
    static StreamerDatabase(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            /*Load the most recent table and return its status */
            let accountData = Streamer_1.setAccountData(new Streamer_1.AccountData(StreamerID));
            return accountData.dbStreamer.query("show tables")
                .then((tables) => __awaiter(this, void 0, void 0, function* () {
                yield Define_1.Define.Settings(accountData);
                yield Define_1.Define.Wallets(accountData);
                accountData.CurrentPollStatus = new PollStatus_1.PollStatus();
                if (tables[0].length < 3)
                    return accountData;
                accountData.CurrentPollID = util_1.getTableName(tables[0], tables[0].length - 4);
                accountData.CurrentWishesID = util_1.getTableName(tables[0], tables[0].length - 3);
                if (Number.isInteger(Number(accountData.CurrentWishesID.charAt(0)))) {
                    if (accountData.CurrentWishesID) {
                        accountData.CurrentPollStatus.PollStarted = false;
                        accountData.CurrentPollStatus.PollWaxed = false;
                        accountData.CurrentPollStatus.PollStoped = false;
                        if (accountData.CurrentWishesID.indexOf(Streamer_1.POLL_WAXED) !== Streamer_1.NOT_IN_STRING) {
                            accountData.CurrentPollStatus.PollWaxed = true;
                            return accountData;
                        }
                        if (accountData.CurrentWishesID.indexOf(Streamer_1.POLL_STARTED) !== Streamer_1.NOT_IN_STRING)
                            accountData.CurrentPollStatus.PollStarted = true;
                        if (accountData.CurrentWishesID.indexOf(Streamer_1.POLL_STOPED) !== Streamer_1.NOT_IN_STRING)
                            accountData.CurrentPollStatus.PollStoped = true;
                        yield Define_1.Define.CurrentPoll(accountData);
                        yield Define_1.Define.CurrentWishes(accountData);
                        return accountData;
                    }
                }
            }));
        });
    }
    static Settings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = Streamer_1.getAccountData(StreamerID);
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
                return accountData.MinerSettings = new MinerSettings_1.MinerSettings(setting.RewardPerMining);
            });
        });
    }
}
exports.Loading = Loading;

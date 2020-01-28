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
const Streamer_1 = require("../database/Streamer");
const Loading_1 = require("../database/Loading");
const MiningResponse_1 = require("./models/MiningResponse");
const dbWalletManager_1 = require("./dbWalletManager");
class MinerManeger {
    static getMinerSettings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = Streamer_1.getAccountData(StreamerID);
            if (!accountData.MinerSettings)
                yield Loading_1.Loading.Settings(StreamerID);
            return accountData.MinerSettings;
        });
    }
    ;
    static UpdateSettings(StreamerID, MinerSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = Streamer_1.getAccountData(StreamerID);
            AccountData.MinerSettings = MinerSettings;
            return AccountData.dbSettings.update(AccountData.MinerSettings, { where: { ID: 1 } }).then(() => {
                return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
        });
    }
    ;
    static MineCoin(StreamerID, TwitchUserID) {
        return __awaiter(this, void 0, void 0, function* () {
            let Now = new Date().getTime();
            let AccountData = Streamer_1.getAccountData(StreamerID);
            let walletManeger = new dbWalletManager_1.WalletManeger(StreamerID, TwitchUserID);
            let WalletOfUser = yield walletManeger.getWallet();
            let TimeBetweenAttempts = Now - WalletOfUser.LastMiningAttemp;
            if (!TimeBetweenAttempts || TimeBetweenAttempts > AccountData.MinerSettings.MinimunTimeForMining)
                yield walletManeger.deposit(AccountData.MinerSettings.RewardPerMining);
            return new MiningResponse_1.MiningResponse(TimeBetweenAttempts, (yield walletManeger.getWallet()).Coins);
        });
    }
}
exports.MinerManeger = MinerManeger;

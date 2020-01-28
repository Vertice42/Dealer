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
const dbLoading_1 = require("../dbLoading");
const MinerSettings_1 = require("../../../models/miner/MinerSettings");
const dbWalletManager_1 = require("./dbWalletManager");
const MiningResult_1 = require("../../../models/miner/MiningResult");
const dbStreamerManager_1 = require("../dbStreamerManager");
class MinerManeger {
    /**
     *
     * @param StreamerID
     */
    static getMinerSettings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            if (!accountData.MinerSettings)
                return dbLoading_1.Loading.Settings(StreamerID);
            return bluebird_1.resolve(accountData.MinerSettings);
        });
    }
    /**
     *
     * @param StreamerID
     * @param minerSettings
     */
    static UpdateSettings(StreamerID, minerSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            AccountData.MinerSettings = new MinerSettings_1.MinerSettings(minerSettings.RewardPerMinute);
            return AccountData.dbSettings.update(minerSettings, { where: { ID: 1 } }).then(() => {
                return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
        });
    }
    /**
     * For the mining of a coin or fractions thereof, it is necessary that mining attempts
     * take place in a predetermined period
     *
     * @param StreamerID
     * @param TwitchUserID
     *
     * @returns MiningResult
     */
    static MineCoin(StreamerID, TwitchUserID) {
        return __awaiter(this, void 0, void 0, function* () {
            let Now = new Date().getTime();
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            let walletManeger = new dbWalletManager_1.WalletManeger(StreamerID, TwitchUserID);
            let wallet = yield walletManeger.getWallet();
            let TimeBetweenAttempts = Now - wallet.LastMiningAttemp;
            if (!TimeBetweenAttempts || TimeBetweenAttempts > MinerSettings_1.MinimunTimeForMining)
                yield walletManeger.deposit(AccountData.MinerSettings.RewardPerMining);
            return new MiningResult_1.MiningResult(TimeBetweenAttempts, (yield walletManeger.getWallet()).Coins);
        });
    }
}
exports.MinerManeger = MinerManeger;

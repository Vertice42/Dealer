"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("bluebird");
const MinerSettings_1 = require("../../../models/miner/MinerSettings");
const dbWalletManager_1 = require("./dbWalletManager");
const MiningResponse_1 = require("../../../models/miner/MiningResponse");
const dbStreamerManager_1 = require("../dbStreamerManager");
class MinerManeger {
    /**
     * For the mining of a coin or fractions thereof, it is necessary that mining attempts
     * take place in a predetermined period
     *
     * @param StreamerID
     * @param TwitchUserID
     *
     * @returns MiningResult
     */
    static async MineCoin(StreamerID, TwitchUserID) {
        let Now = new Date().getTime();
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        if (!AccountData.MinerSettings)
            return bluebird_1.reject({
                RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
            });
        let walletManeger = new dbWalletManager_1.dbWalletManeger(StreamerID, TwitchUserID);
        let wallet = await walletManeger.getWallet();
        let TimeBetweenAttempts = Now - wallet.LastMiningAttemp;
        if (!TimeBetweenAttempts || TimeBetweenAttempts > MinerSettings_1.MinimunTimeForMining)
            await walletManeger.deposit(AccountData.MinerSettings.RewardPerMining);
        return new MiningResponse_1.MiningResponse(TimeBetweenAttempts, (await walletManeger.getWallet()).Coins, MinerSettings_1.MinimunTimeForMining);
    }
}
exports.default = MinerManeger;

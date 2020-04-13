import { reject } from "bluebird";
import { MINIMUM_TIME_FOR_MINING } from "../../../models/streamer_settings/MinerSettings";
import { MiningResponse } from "../../../models/miner/MiningResponse";
import { dbManager } from "../dbManager";
import { dbWalletManager } from "../wallet/dbWalletManager";

export default class MinerManager {
    /**
     * For the mining of a coin or fractions thereof, it is necessary that mining attempts 
     * take place in a predetermined period
     * 
     * @param StreamerID 
     * @param TwitchUserID 
     * 
     * @returns MiningResult
     */
    static async MineCoin(StreamerID: string, TwitchUserID: string) {
        let Now = new Date().getTime();
        let AccountData = dbManager.getAccountData(StreamerID);
        if (!AccountData) return reject({
            RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'});

        let walletManager = new dbWalletManager(StreamerID, TwitchUserID)

        let wallet = await walletManager.getWallet();
        let TimeBetweenAttempts = Now - wallet.LastMiningAttempt.getTime();        
        
        if (!TimeBetweenAttempts || TimeBetweenAttempts > MINIMUM_TIME_FOR_MINING)
            await walletManager.deposit(AccountData.MinerSettings.RewardPerMining);

        walletManager.updateLastMiningAttempt();

        return new MiningResponse(TimeBetweenAttempts, (await walletManager.getWallet()).Coins, MINIMUM_TIME_FOR_MINING);

    }
}

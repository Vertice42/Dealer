import { reject } from "bluebird";
import { MINIMUM_TIME_FOR_MINING } from "../../../models/streamer_settings/MinerSettings";
import { MiningResponse } from "../../../models/miner/MiningResponse";
import { dbWalletManager } from "../wallet/dbWalletManager";
import dbManager from "../dbManager";

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
        let AccountData = dbManager.getAccountData(StreamerID);
        if (!AccountData) throw {RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'}
        
        let Now = new Date().getTime();
        let walletManager = new dbWalletManager(StreamerID, TwitchUserID)

        let wallet = await walletManager.getWallet();
        let TimeBetweenAttempts = Now - wallet.LastMiningAttempt.getTime();        
        
        if (!TimeBetweenAttempts || TimeBetweenAttempts > MINIMUM_TIME_FOR_MINING)
            await walletManager.deposit(AccountData.MinerSettings.RewardPerMining);

        walletManager.updateLastMiningAttempt();

        return new MiningResponse(TimeBetweenAttempts, (await walletManager.getWallet()).Coins, MINIMUM_TIME_FOR_MINING);

    }
}

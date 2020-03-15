import { reject } from "bluebird";
import { MINIMUN_TIME_FOR_MINING } from "../../../models/streamer_settings/MinerSettings";
import { MiningResponse } from "../../../models/miner/MiningResponse";
import { dbManager } from "../dbManager";
import { dbWalletManeger } from "../wallet/dbWalletManager";

export default class MinerManeger {
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

        let walletManeger = new dbWalletManeger(StreamerID, TwitchUserID)

        let wallet = await walletManeger.getWallet();
        let TimeBetweenAttempts = Now - wallet.LastMiningAttemp.getTime();
        
        if (!TimeBetweenAttempts || TimeBetweenAttempts > MINIMUN_TIME_FOR_MINING)
            await walletManeger.deposit(AccountData.MinerSettings.RewardPerMining);

        walletManeger.updateLastMiningAttemp();

        return new MiningResponse(TimeBetweenAttempts, (await walletManeger.getWallet()).Coins, MINIMUN_TIME_FOR_MINING);

    }
}

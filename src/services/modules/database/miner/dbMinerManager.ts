import { resolve, reject, } from "bluebird";
import { Loading } from "../dbLoading";
import { MinerSettings, MinimunTimeForMining } from "../../../models/miner/MinerSettings";
import { WalletManeger } from "./dbWalletManager";
import { MiningResponse } from "../../../models/miner/MiningResponse";
import { dbStreamerManager } from "../dbStreamerManager";

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
        let AccountData = dbStreamerManager.getAccountData(StreamerID);
        if (!AccountData.MinerSettings) return reject({
            RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'});

        let walletManeger = new WalletManeger(StreamerID, TwitchUserID)

        let wallet = await walletManeger.getWallet();
        let TimeBetweenAttempts = Now - wallet.LastMiningAttemp;

        if (!TimeBetweenAttempts || TimeBetweenAttempts > MinimunTimeForMining)
            await walletManeger.deposit(AccountData.MinerSettings.RewardPerMining)

        return new MiningResponse(TimeBetweenAttempts, (await walletManeger.getWallet()).Coins, MinimunTimeForMining);

    }
}

import { resolve, reject, } from "bluebird";
import { Loading } from "../dbLoading";
import { MinerSettings, MinimunTimeForMining } from "../../../models/miner/MinerSettings";
import { WalletManeger } from "./dbWalletManager";
import { MiningResponse } from "../../../models/miner/MiningResponse";
import { dbStreamerManager } from "../dbStreamerManager";

export class MinerManeger {

    /**
     * 
     * @param StreamerID 
     */
    static async getMinerSettings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);

        if (!accountData.MinerSettings) return Loading.Settings(StreamerID);

        return resolve(accountData.MinerSettings);
    }
    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateSettings(StreamerID: string, minerSettings) {
        let AccountData = dbStreamerManager.getAccountData(StreamerID);
        AccountData.MinerSettings = new MinerSettings(minerSettings.RewardPerMinute);
        return AccountData.dbSettings.update(minerSettings, { where: { ID: 1 } }).then(() => {
            return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
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

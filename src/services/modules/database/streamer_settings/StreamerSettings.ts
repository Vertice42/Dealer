import { dbStreamerManager } from "../dbStreamerManager";
import { Loading } from "../dbLoading";
import { resolve } from "bluebird";
import { MinerSettings } from "../../../models/miner/MinerSettings";
import { CoinsSettings } from "../../../models/CoinsSettings";

export default class StreamerSettings {
    /**
     * 
     * @param StreamerID 
     */
    static async getMinerSettings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);        

        if (!accountData.MinerSettings) return Loading.MinerSettings(StreamerID);

        return resolve(accountData.MinerSettings);
    }
    /**
     * 
     * @param StreamerID 
     */
    static async getCoinsSettings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);

        if (!accountData.CoinsSettings) return Loading.CoinsSettings(StreamerID);

        return resolve(accountData.CoinsSettings);
    }

    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateMinerSettings(StreamerID: string, NewMinerSettings: MinerSettings) {
        let AccountData = dbStreamerManager.getAccountData(StreamerID);
        AccountData.MinerSettings = NewMinerSettings
        return AccountData.dbSettings.update(NewMinerSettings, { where: { SettingName: MinerSettings.name } })
            .then(() => {
                return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
    }

    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateCoinsSettings(StreamerID: string, NewCoinsSettings: CoinsSettings) {
        let AccountData = dbStreamerManager.getAccountData(StreamerID);
        AccountData.CoinsSettings = NewCoinsSettings;
        return AccountData.dbSettings.update(NewCoinsSettings, { where: { SettingName: CoinsSettings.name } })
            .then(() => {
                return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
    }
}
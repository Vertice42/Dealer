import { dbManager } from "../dbManager";
import { Loading } from "../dbLoading";
import { resolve } from "bluebird";
import { MinerSettings } from "../../../models/miner/MinerSettings";
import { CoinsSettings } from "../../../models/streamer_settings/CoinsSettings";

export default class StreamerSettingsManager {

    /**
     * 
     * @param StreamerID 
     */
    static async getCoinsSettings(StreamerID: string) {
        let accountData = dbManager.getAccountData(StreamerID);        

        if (!accountData.CoinsSettings) return Loading.CoinsSettings(StreamerID);

        return resolve(accountData.CoinsSettings);
    }
    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateCoinsSettings(StreamerID: string, NewCoinsSettings: CoinsSettings) {
        let AccountData = dbManager.getAccountData(StreamerID);
        AccountData.CoinsSettings = NewCoinsSettings;
        return AccountData.dbSettings.update({ SettingsJson: NewCoinsSettings }, { where: { SettingName: CoinsSettings.name } })
            .then(() => {
                return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
    }
    /**
   * 
   * @param StreamerID 
   */
    static async getMinerSettings(StreamerID: string) {
        let accountData = dbManager.getAccountData(StreamerID);

        if (!accountData.MinerSettings) return Loading.MinerSettings(StreamerID);

        return resolve(accountData.MinerSettings);
    }
    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateMinerSettings(StreamerID: string, NewMinerSettings: MinerSettings) {
        let AccountData = dbManager.getAccountData(StreamerID);
        AccountData.MinerSettings = NewMinerSettings;
        return AccountData.dbSettings.update({ SettingsJson: NewMinerSettings }, { where: { SettingName: MinerSettings.name } })
            .then(() => {
                return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            }).catch((rej) => {
                console.log(rej);
            })
    }

}
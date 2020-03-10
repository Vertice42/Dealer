import { dbManager } from "../dbManager";
import { resolve } from "bluebird";
import { MinerSettings } from "../../../models/streamer_settings/MinerSettings";
import { CoinsSettings } from "../../../models/streamer_settings/CoinsSettings";

export default class StreamerSettingsManager {

    /**
     * 
     * @param StreamerID 
     */
    static async getCoinsSettings(StreamerID: string) {
        let accountData = dbManager.getAccountData(StreamerID);
        return (await accountData.dbSettings.findOne({ where: { SettingName: CoinsSettings.name } })).SettingsJson;
    }
    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateOrCreateCoinsSettings(StreamerID: string, NewCoinsSettings: CoinsSettings) {
        let AccountData = dbManager.getAccountData(StreamerID);        
        return AccountData.dbSettings.update({ SettingsJson: NewCoinsSettings }, { where: { SettingName: CoinsSettings.name } })
            .then(async (result) => {                
                if (!result[0]) {                    
                    result = await AccountData.dbSettings.create({
                        SettingName: CoinsSettings.name,
                        SettingsJson: NewCoinsSettings
                    })[0];
                }
                return resolve({ SuccessfullyUpdateCoinsSettings: result })

            });
    }
    /**
   * 
   * @param StreamerID 
   */
    static async getMinerSettings(StreamerID: string) {        
        return dbManager.getAccountData(StreamerID).MinerSettings;
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
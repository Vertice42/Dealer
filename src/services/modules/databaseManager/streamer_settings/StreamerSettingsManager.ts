import dbManager from "../dbManager";
import { resolve } from "bluebird";
import { MinerSettings } from "../../../models/streamer_settings/MinerSettings";
import { CoinsSettings } from "../../../models/streamer_settings/CoinsSettings";
import { Json } from "sequelize/types/lib/utils";
import { DealerSettings } from "../../../models/streamer_settings/dbSettings";

export default class StreamerSettingsManager {

    /**
     * 
     * @param StreamerID 
     */
    static async getCoinsSettings(StreamerID: string) {
        let accountData = dbManager.getAccountData(StreamerID);
        let dbSetting = await accountData.dbSettings.findOne({ where: { SettingName: CoinsSettings.name } })
        if (dbSetting) return JSON.parse(dbSetting.SettingsJson);

        return {};
    }
    /**
     * 
     * @param StreamerID 
     * @param minerSettings 
     */
    static async UpdateOrCreateCoinsSettings(StreamerID: string, NewCoinsSettings: CoinsSettings) {
        let AccountData = dbManager.getAccountData(StreamerID);
        let dealerSettings = new DealerSettings(CoinsSettings.name, NewCoinsSettings);

        let dbSetting = await AccountData.dbSettings.findOne({ where: { SettingName: dealerSettings.SettingName } });

        if (dbSetting) {
            return dbSetting.update(dealerSettings)
        } else {
            return AccountData.dbSettings.create(dealerSettings);
        }
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
        await (await AccountData.dbSettings.findOne({ where: { SettingName: MinerSettings.name } }))
            .update(new DealerSettings(MinerSettings.name, NewMinerSettings));

        return resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
    }

}
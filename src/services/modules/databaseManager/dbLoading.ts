import { MinerSettings } from "../../models/streamer_settings/MinerSettings";
import { Define } from "./dbDefine";
import { AccountData } from "../../models/dealer/AccountData";
import { resolve, reject } from "bluebird";
import { DealerSettings } from "../../models/streamer_settings/dbSettings";
export default class Loading {
    /**
     * Loads everything needed for all services to work properly
     * @returns AccountData
     * */
    private static async MinerSettings(AccountData: AccountData) {
        return AccountData.dbSettings
            .findOne({ where: { SettingName: MinerSettings.name } })
            .then(async (dbSetting) => {
                if (!dbSetting) {
                    dbSetting = await AccountData.dbSettings.create(
                        new DealerSettings(MinerSettings.name, new MinerSettings(0.2)));
                    return Loading.MinerSettings(AccountData);
                }
                AccountData.MinerSettings = <MinerSettings>JSON.parse(dbSetting.SettingsJson);
                return resolve(AccountData.MinerSettings);
            })
    }

    public static async StreamerAccountData(StreamerID: string) {
        let accountData: AccountData = new AccountData(StreamerID);
        let DefinitionPromises = [
            Define.PollsIndex(accountData),
            Define.Settings(accountData),
            Define.Wallets(accountData),
            Define.Store(accountData),
            Define.PurchaseOrder(accountData)
        ]
        await Promise.all(DefinitionPromises)
            .catch(error => {
                console.error(error);
            })
            .then(() => {
                return Loading.MinerSettings(accountData);
            })
        return accountData;
    }
}

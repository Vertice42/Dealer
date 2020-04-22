import { PollStatus } from "../../models/poll/PollStatus";
import { MinerSettings } from "../../models/streamer_settings/MinerSettings";
import { Define } from "./dbDefine";
import { POLL_WAXED, NOT_IN_STRING, POLL_STARTED, POLL_STOPPED, dbManager, COMPLETED } from "./dbManager";
import { AccountData } from "../../models/dealer/AccountData";
import { getTableName } from "./dbUtil";
import { resolve } from "bluebird";
export class Loading {
    /**
     * Loads everything needed for all services to work properly
     * @returns AccountData
     * */
    private static async MinerSettings(AccountData: AccountData) {
        return AccountData.dbSettings
            .findOne({ where: { SettingName: MinerSettings.name } })
            .then(async (dbSetting) => {
                if (!dbSetting) {
                    dbSetting = await AccountData.dbSettings.create({
                        SettingName: MinerSettings.name,
                        SettingsJson: new MinerSettings(0.2)
                    });
                    return Loading.MinerSettings(AccountData);
                }
                AccountData.MinerSettings = <MinerSettings>dbSetting.SettingsJson;
                return resolve(dbSetting.SettingsJson);
            })
    }

    public static async StreamerAccountData(StreamerID: string) {
        await dbManager.CreateIfNotExistStreamerDataBase(StreamerID);

        let accountData: AccountData = new AccountData(StreamerID);

        let DefinitionPromises = [
            Define.PollsIndex(accountData),
            Define.Settings(accountData),
            Define.Wallets(accountData),
            Define.Store(accountData),
            Define.PurchaseOrder(accountData)
        ]
        await Promise.all(DefinitionPromises);
        await Loading.MinerSettings(accountData);
        return accountData;
    }
}

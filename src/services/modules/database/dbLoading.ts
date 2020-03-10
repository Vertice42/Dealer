import { PollStatus } from "../../models/poll/PollStatus";
import { MinerSettings } from "../../models/streamer_settings/MinerSettings";
import { Define } from "./dbDefine";
import { POLL_WAXED, NOT_IN_STRING, POLL_STARTED, POLL_STOPED, dbManager } from "./dbManager";
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
                        SettingsJson: new MinerSettings(100)
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

        accountData.CurrentPollStatus = new PollStatus();

        let DefinitionPromises = [
            Define.Settings(accountData),
            Define.Wallets(accountData),
            Define.Store(accountData),
            Define.PurchaseOrder(accountData)
        ]
        await Promise.all(DefinitionPromises);

        await Loading.MinerSettings(accountData);

        let tables = await accountData.dbStreamer.query("show tables");
        if (tables[0].length < DefinitionPromises.length + 2) {
            accountData.CurrentPollStatus.waxe();
            return accountData;
        }
        //If there are only 2 tables in the database, no poll has been created yet
        accountData.CurrentPollID = await getTableName(tables[0], tables[0].length - (DefinitionPromises.length + 1));
        accountData.CurrentBettingsID = await getTableName(tables[0], tables[0].length - (DefinitionPromises.length + 2));
        /**
         * The wallet and settings table are in the same database and will always be
         * the first and second index, while the most recent Bettings poll tables will 
         * always be the 3rd and 4th index respectively
         */

        if (accountData.CurrentPollID) {

            if (accountData.CurrentBettingsID.indexOf(POLL_WAXED) !== NOT_IN_STRING)
                accountData.CurrentPollStatus.PollWaxed = true;

            if (accountData.CurrentBettingsID.indexOf(POLL_STARTED) !== NOT_IN_STRING)
                accountData.CurrentPollStatus.PollStarted = true;

            if (accountData.CurrentBettingsID.indexOf(POLL_STOPED) !== NOT_IN_STRING)
                accountData.CurrentPollStatus.PollStoped = true;

            await Define.CurrentPollButtons(accountData);
            await Define.CurrentBettings(accountData);
        }        
        return accountData;
    }
}

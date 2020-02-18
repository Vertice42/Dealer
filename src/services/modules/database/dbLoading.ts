import { PollStatus } from "../../models/poll/PollStatus";
import { MinerSettings } from "../../models/miner/MinerSettings";
import { Define } from "./dbDefine";
import { POLL_WAXED, NOT_IN_STRING, POLL_STARTED, POLL_STOPED, dbStreamerManager } from "./dbStreamerManager";
import { AccountData } from "../../models/AccountData";
import { getTableName } from "./dbUtil";
import { CoinsSettings } from "../../models/streamer_settings/CoinsSettings";
export class Loading {
    /**
     * Loads everything needed for all services to work properly
     * @returns AccountData
     * */
    static async StreamerDatabase(StreamerID: string) {
        await dbStreamerManager.CreateIfNotExistStreamerDataBase(StreamerID);

        let accountData: AccountData = dbStreamerManager
            .setAccountData(new AccountData(StreamerID));

        accountData.CurrentPollStatus = new PollStatus();

        let DefinitionPromises = [
            Define.Settings(accountData),
            Define.Wallets(accountData),
            Define.Store(accountData),
            Define.PurchaseOrder(accountData)
        ]
        await Promise.all(DefinitionPromises);

        let tables = await accountData.dbStreamer.query("show tables");
        if (tables[0].length < DefinitionPromises.length + 2) {
            accountData.CurrentPollStatus.waxe();
            return accountData;
        }
        //If there are only 2 tables in the database, no poll has been created yet
        accountData.CurrentPollID = getTableName(tables[0], tables[0].length - (DefinitionPromises.length+1));
        accountData.CurrentBettingsID = getTableName(tables[0], tables[0].length - (DefinitionPromises.length + 2));
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
    static async MinerSettings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);
        return accountData.dbSettings
            .findOne({ where: { SettingName: MinerSettings.name } })
            .then(async (dbSettings) => {
                if (dbSettings) {
                    return accountData.MinerSettings = <MinerSettings>dbSettings.SettingsJson;
                } else {
                    await accountData.dbSettings.create({
                        SettingName: MinerSettings.name,
                        SettingsJson: new MinerSettings(100)
                    });
                    return Loading.MinerSettings(StreamerID);
                }
            })
    }
    static async CoinsSettings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);
        return accountData.dbSettings
            .findOne({ where: { SettingName: CoinsSettings.name } })
            .then(async (dbSettings) => {
                if (dbSettings) {
                    return accountData.CoinsSettings = <CoinsSettings>dbSettings.SettingsJson;
                } else {
                    await accountData.dbSettings.create({
                        SettingName: CoinsSettings.name,
                        SettingsJson: new CoinsSettings()
                    });
                    return Loading.CoinsSettings(StreamerID);
                }
            })
    }
    static async Store(StreamerID: string) {

    }
}

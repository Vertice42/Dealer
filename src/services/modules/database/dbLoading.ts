import { resolve, reject } from "bluebird";
import { PollStatus } from "../../models/poll/PollStatus";
import { MinerSettings } from "../../models/miner/MinerSettings";
import { Define } from "./dbDefine";
import { POLL_WAXED, NOT_IN_STRING, POLL_STARTED, POLL_STOPED, dbStreamerManager } from "./dbStreamerManager";
import { AccountData } from "../../models/AccountData";
import { getTableName } from "./dbUtil";
import { dbSettings } from "../../models/poll/dbSettings";
export class Loading {
    /**
     * Loads everything needed for all services to work properly
     * @returns AccountData
     * */
    static async StreamerDatabase(StreamerID: string) {
        await dbStreamerManager.CreateStreamerDataBase(StreamerID);
        
        let accountData:AccountData = dbStreamerManager
        .setAccountData(new AccountData(StreamerID));
        
        accountData.CurrentPollStatus = new PollStatus();

        await Define.Settings(accountData);
        await Define.Wallets(accountData);

        let tables = await accountData.dbStreamer.query("show tables");
        if (tables[0].length < 3) {
            accountData.CurrentPollStatus.waxe();
            return accountData;
        }
        //If there are only 2 tables in the database, no poll has been created yet

        accountData.CurrentPollID = getTableName(tables[0], tables[0].length - 3);
        accountData.CurrentBettingsID = getTableName(tables[0], tables[0].length - 4);
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

            await Define.CurrentPoll(accountData);
            await Define.CurrentBettings(accountData);
        }

        return accountData;
    }
    static async Settings(StreamerID: string) {
        let accountData = dbStreamerManager.getAccountData(StreamerID);
        return accountData.dbSettings
            .findOne({ where: { id: 1 } })
            .then((res) => {
                return (res) ? resolve(res) : reject(undefined);
            })
            .catch(async (reject) => {
                if (!reject) {
                    await accountData.dbSettings.create();
                    return Loading.Settings(StreamerID);
                }
            })
            .then((setting: dbSettings) => {
                return accountData.MinerSettings = new MinerSettings(setting.RewardPerMinute);
            });
    }
}

import { Sequelize } from "sequelize";

import { AccountData } from "../../models/dealer/AccountData";
import { dbPollManager } from "./poll/dbPollManager";
import { DeleteTable } from "./dbUtil";

export const NOT_IN_STRING = -1;

export const POLL_WAXED = "_waxed";
export const POLL_STARTED = "_started";
export const POLL_STOPPED = "_stopped";
export const COMPLETED = "_completed";

export const dbDealer = new Sequelize(
    'dealer',
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        logging: (process.env.LOGGING === 'true')
    });

var AccountDataArray: AccountData[] = [];
/**
 * Contains methods for managing a streamer database
 */
export class dbManager {

    static getAccountData(StreamerID: string): AccountData {
        return AccountDataArray[StreamerID];
    }
    static setAccountData(AccountData: AccountData): AccountData {
        AccountDataArray[AccountData.StreamerID] = AccountData;
        return AccountDataArray[AccountData.StreamerID];
    }
    static removeAccountData(StreamerID: string) {
        AccountDataArray.splice(AccountDataArray
            .indexOf(dbManager.getAccountData(StreamerID)), 1);
    }
    static async deleteStreamerData(StreamerID: string) {
        let AccountData = dbManager.getAccountData(StreamerID);
        let PromisesOfPOllDestruction = [];
        let PollManager = new dbPollManager(StreamerID);
    
        for (const Poll of await AccountData.dbPollsIndexes.findAll()) {            
            PromisesOfPOllDestruction.push(DeleteTable(await PollManager.get_dbPollButtons(Poll.id)));
            PromisesOfPOllDestruction.push(DeleteTable(await PollManager.get_dbBets(Poll.id)));
        }

        return Promise.all(PromisesOfPOllDestruction).then(() => {
            return Promise.all([
                DeleteTable(AccountData.dbPollsIndexes),
                DeleteTable(AccountData.dbPurchaseOrders),
                DeleteTable(AccountData.dbSettings),
                DeleteTable(AccountData.dbStore),
                DeleteTable(AccountData.dbWallets)
            ])
        })
    }
}

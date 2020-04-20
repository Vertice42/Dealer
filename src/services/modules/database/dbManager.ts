import { Sequelize } from "sequelize";

import { resolve, reject } from "bluebird";
import { AccountData } from "../../models/dealer/AccountData";
import dbConfigs from "./dbConfigs";

export const NOT_IN_STRING = -1;

export const POLL_WAXED = "_waxed";
export const POLL_STARTED = "_started";
export const POLL_STOPPED = "_stopped";
export const COMPLETED = "_completed";

const STREAMER_DATABASE_NAME = 'dealer_streamer_';

const Mysql = new Sequelize(
    'mysql',
    dbConfigs.User,
    dbConfigs.Password,
    dbConfigs.SequelizeOptions);

var AccountDataArray: AccountData[] = [];
/**
 * Contains methods for managing a streamer database
 */
export class dbManager {
    static getStreamerDataBase(StreamerID: string) {
        return new Sequelize(
            STREAMER_DATABASE_NAME + StreamerID,
            dbConfigs.User,
            dbConfigs.Password,
            dbConfigs.SequelizeOptions)
    }

    static getAccountData(StreamerID: string): AccountData {                
        return AccountDataArray[StreamerID];
    }
    static setAccountData(AccountData: AccountData):AccountData {
        AccountDataArray[AccountData.StreamerID] = AccountData;
        return AccountDataArray[AccountData.StreamerID];
    }
    static removeAccountData(StreamerID: string) {
        AccountDataArray.splice(AccountDataArray
            .indexOf(dbManager.getAccountData(StreamerID)), 1);
    }

    static async CreateIfNotExistStreamerDataBase(StreamerID: string) {
        return Mysql.query("CREATE DATABASE " + STREAMER_DATABASE_NAME + StreamerID)
            .then(() => {
                return resolve({ StreamerDataBaseCreated: StreamerID });
            })
            .catch((error) => {
                if (("CREATE DATABASE ?" + error).indexOf('database exists') > NOT_IN_STRING)
                    return resolve({ StreamerDataBaseAlreadyExists: { StreamerID } })
                else
                    return reject(error);
            })
    }
    static async DeleteStreamerDataBase(StreamerID: string) {

        return Mysql.query("drop database " + STREAMER_DATABASE_NAME + StreamerID)
            .then((res) => {
                dbManager.removeAccountData(StreamerID);
                return resolve(res);
            })
    }

    static async getDataBase(DataBaseName: string) {
        return new Sequelize(
            DataBaseName
            , dbConfigs.User,
            dbConfigs.Password,
            dbConfigs.SequelizeOptions)
    }

    static async CreateIfNotExistSDataBase(DataBaseName: string) {
        await Mysql.query("CREATE DATABASE " + DataBaseName)
            .then(() => {
                return resolve({ StreamerDataBaseCreated: DataBaseName });
            })
            .catch((error) => {
                if (("CREATE DATABASE ?" + error).indexOf('database exists') > NOT_IN_STRING)
                    return resolve({ StreamerDataBaseAlreadyExists: { StreamerID: DataBaseName } })
                else
                    return reject(error);
            })
        return this.getDataBase(DataBaseName);
    }

    async DeleteDataBase(DataBaseName: string) {
        return Mysql.query("drop database " + DataBaseName)
            .then((res) => {
                return resolve(res);
            })
    }
}

import { Loading } from "./dbLoading";
import { Sequelize } from "sequelize";

import DatabaseConfig from "../../configs/DatabseConfig";
import { resolve, reject } from "bluebird";
import { AccountData } from "../../models/AccountData";

export const NOT_IN_STRING = -1;

export const POLL_WAXED = "_waxed";
export const POLL_STARTED = "_started";
export const POLL_STOPED = "_stoped";

const STREAMER_DATABASE_NAME = 'streamer_';

const Mysql = new Sequelize(
    'mysql',
    DatabaseConfig.User,
    DatabaseConfig.Password,
    DatabaseConfig.SequelizeOptions);

var AccountDataArray: AccountData[] = [];
/**
 * Contains methods for managing a stremer's database
 */
export class dbStreamerManager {

    static getStreamerDataBase(StreamerID: string) {
        //TODO add username end pasword of the streme
        return new Sequelize(
            STREAMER_DATABASE_NAME + StreamerID,
            DatabaseConfig.User,
            DatabaseConfig.Password,
            DatabaseConfig.SequelizeOptions)
    }

    static getAccountData(StreamerID: string): AccountData {
        return AccountDataArray[StreamerID];
    }
    static setAccountData(AccountData: AccountData) {
        AccountDataArray[AccountData.StreamerID] = AccountData;
        return AccountDataArray[AccountData.StreamerID];
    }
    static removeAccountData(StreamerID: string) {
        AccountDataArray.splice(AccountDataArray
            .indexOf(dbStreamerManager.getAccountData(StreamerID)), 1);
    }

    static async CreateStreamerDataBase(StreamerID: string) {
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
                dbStreamerManager.removeAccountData(StreamerID);
                return resolve(res);
            })
    }
}

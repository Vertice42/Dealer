"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const DatabseConfig_1 = require("../../configs/DatabseConfig");
const bluebird_1 = require("bluebird");
exports.NOT_IN_STRING = -1;
exports.POLL_WAXED = "_waxed";
exports.POLL_STARTED = "_started";
exports.POLL_STOPED = "_stoped";
const STREAMER_DATABASE_NAME = 'streamer_';
const Mysql = new sequelize_1.Sequelize('mysql', DatabseConfig_1.default.User, DatabseConfig_1.default.Password, DatabseConfig_1.default.SequelizeOptions);
var AccountDataArray = [];
/**
 * Contains methods for managing a stremer's database
 */
class dbStreamerManager {
    static getStreamerDataBase(StreamerID) {
        //TODO add username end pasword of the streme
        return new sequelize_1.Sequelize(STREAMER_DATABASE_NAME + StreamerID, DatabseConfig_1.default.User, DatabseConfig_1.default.Password, DatabseConfig_1.default.SequelizeOptions);
    }
    static getAccountData(StreamerID) {
        return AccountDataArray[StreamerID];
    }
    static setAccountData(AccountData) {
        AccountDataArray[AccountData.StreamerID] = AccountData;
        return AccountDataArray[AccountData.StreamerID];
    }
    static removeAccountData(StreamerID) {
        AccountDataArray.splice(AccountDataArray
            .indexOf(dbStreamerManager.getAccountData(StreamerID)), 1);
    }
    static async CreateIfNotExistStreamerDataBase(StreamerID) {
        return Mysql.query("CREATE DATABASE " + STREAMER_DATABASE_NAME + StreamerID)
            .then(() => {
            return bluebird_1.resolve({ StreamerDataBaseCreated: StreamerID });
        })
            .catch((error) => {
            if (("CREATE DATABASE ?" + error).indexOf('database exists') > exports.NOT_IN_STRING)
                return bluebird_1.resolve({ StreamerDataBaseAlreadyExists: { StreamerID } });
            else
                return bluebird_1.reject(error);
        });
    }
    static async DeleteStreamerDataBase(StreamerID) {
        return Mysql.query("drop database " + STREAMER_DATABASE_NAME + StreamerID)
            .then((res) => {
            dbStreamerManager.removeAccountData(StreamerID);
            return bluebird_1.resolve(res);
        });
    }
}
exports.dbStreamerManager = dbStreamerManager;

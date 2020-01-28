"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbLoading_1 = require("./dbLoading");
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
class dbStreamer {
    static getStreamerDataBase(StreamerID) {
        //TODO add username end pasword of the stremer
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
            .indexOf(dbStreamer.getAccountData(StreamerID)), 1);
    }
    static CreateStreamerDataBase(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Mysql.query("create database " + STREAMER_DATABASE_NAME + StreamerID);
            yield dbLoading_1.Loading.StreamerDatabase(StreamerID);
            return bluebird_1.resolve({ StreamerDataBaseCreated: { StreamerID: StreamerID } });
        });
    }
    static DeleteStreamerDataBase(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            return Mysql.query("drop database " + STREAMER_DATABASE_NAME + StreamerID)
                .then((res) => {
                dbStreamer.removeAccountData(StreamerID);
                return bluebird_1.resolve(res);
            });
        });
    }
}
exports.dbStreamer = dbStreamer;

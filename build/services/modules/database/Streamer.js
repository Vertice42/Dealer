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
const Loading_1 = require("./Loading");
const sequelize_1 = require("sequelize");
const DatabseConfig_1 = require("../../configs/DatabseConfig");
const bluebird_1 = require("bluebird");
exports.NOT_IN_STRING = -1;
exports.POLL_WAXED = "_waxed";
exports.POLL_STARTED = "_started";
exports.POLL_STOPED = "_stoped";
const STREAMER_DATABASE_NAME = 'streamer_';
const Mysql = new sequelize_1.Sequelize('mysql', DatabseConfig_1.default.User, DatabseConfig_1.default.Password, DatabseConfig_1.default.SequelizeOptions);
class AccountData {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
        this.dbStreamer = getStreamerDataBase(StreamerID);
        this.dbCurrentPollButtons = null;
        this.dbCurrentWishes = null;
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.CurrentPollID = null;
        this.CurrentWishesID = null;
        this.CurrentPollStatus = null;
        this.LastUpdate = null;
    }
}
exports.AccountData = AccountData;
var AccountDataArray = [];
function getStreamerDataBase(StreamerID) {
    //TODO add username end pasword of the stremer
    return new sequelize_1.Sequelize(STREAMER_DATABASE_NAME + StreamerID, DatabseConfig_1.default.User, DatabseConfig_1.default.Password, DatabseConfig_1.default.SequelizeOptions);
}
function getAccountData(StreamerID) {
    return AccountDataArray[StreamerID];
}
exports.getAccountData = getAccountData;
function setAccountData(AccountData) {
    AccountDataArray[AccountData.StreamerID] = AccountData;
    return AccountDataArray[AccountData.StreamerID];
}
exports.setAccountData = setAccountData;
function removeAccountData(StreamerID) {
    AccountDataArray.splice(AccountDataArray.indexOf(getAccountData(StreamerID)), 1);
}
function CreateStreamerDataBase(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Mysql.query("create database " + STREAMER_DATABASE_NAME + StreamerID);
        yield Loading_1.Loading.StreamerDatabase(StreamerID);
        return bluebird_1.resolve({ StreamerDataBaseCreated: { StreamerID: StreamerID } });
    });
}
exports.CreateStreamerDataBase = CreateStreamerDataBase;
function DeleteStreamerDataBase(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return Mysql.query("drop database " + STREAMER_DATABASE_NAME + StreamerID)
            .then((res) => {
            removeAccountData(StreamerID);
            return bluebird_1.resolve(res);
        });
    });
}
exports.DeleteStreamerDataBase = DeleteStreamerDataBase;

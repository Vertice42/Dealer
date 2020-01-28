"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../modules/database/dbStreamerManager");
class AccountData {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
        this.dbStreamer = dbStreamerManager_1.dbStreamerManager.getStreamerDataBase(StreamerID);
        this.dbCurrentPollButtons = null;
        this.dbCurrentBettings = null;
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.CurrentPollID = null;
        this.CurrentBettingsID = null;
        this.CurrentPollStatus = null;
        this.LastUpdate = null;
    }
}
exports.AccountData = AccountData;

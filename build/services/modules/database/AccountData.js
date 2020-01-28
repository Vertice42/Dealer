"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamer_1 = require("./dbStreamer");
class AccountData {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
        this.dbStreamer = dbStreamer_1.getStreamerDataBase(StreamerID);
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

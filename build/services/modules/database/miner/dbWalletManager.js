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
const dbStreamerManager_1 = require("../dbStreamerManager");
const bluebird_1 = require("bluebird");
function getWallet(StreamerID, TwitchUserID) {
    return __awaiter(this, void 0, void 0, function* () {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        if (!AccountData)
            return bluebird_1.reject({
                RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
            });
        return (yield AccountData.dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
    });
}
exports.getWallet = getWallet;
/**
 * These classes include methods to manage Wallets in db
 */
class dbWalletManeger {
    constructor(StreamerID, TwitchUserID) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
    }
    getWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return getWallet(this.StreamerID, this.TwitchUserID);
        });
    }
    deposit(deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield getWallet(this.StreamerID, this.TwitchUserID);
            return wallet.update({ Coins: wallet.Coins + deposit });
        });
    }
    withdraw(withdraw) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield getWallet(this.StreamerID, this.TwitchUserID);
            return wallet.update({ Coins: wallet.Coins - withdraw });
        });
    }
}
exports.dbWalletManeger = dbWalletManeger;

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
const Streamer_1 = require("../../module/database/Streamer");
function getWallet(StreamerID, TwitchUserID) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield Streamer_1.getAccountData(StreamerID).dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
    });
}
exports.getWallet = getWallet;
class WalletManeger {
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
exports.WalletManeger = WalletManeger;

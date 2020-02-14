"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
const bluebird_1 = require("bluebird");
async function getWallet(StreamerID, TwitchUserID) {
    let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
    if (!AccountData)
        return bluebird_1.reject({
            RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
        });
    return (await AccountData.dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
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
    async getWallet() {
        return getWallet(this.StreamerID, this.TwitchUserID);
    }
    async deposit(deposit) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins + deposit });
    }
    async withdraw(withdraw) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins - withdraw });
    }
}
exports.dbWalletManeger = dbWalletManeger;

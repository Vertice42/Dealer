"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
const bluebird_1 = require("bluebird");
const sequelize_1 = require("sequelize");
async function getWallet(StreamerID, TwitchUserID) {
    let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
    if (!AccountData)
        return bluebird_1.reject({
            RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
        });
    return (await AccountData.dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
}
exports.getWallet = getWallet;
async function getAllWallets(StreamerID, TwitchUserID) {
    let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
    if (AccountData) {
        if (TwitchUserID === 'undefined') {
            return AccountData.dbWallets.findAll({ order: [['Coins', 'DESC']], limit: 20 });
        }
        else {
            return AccountData.dbWallets.findAll({
                where: { TwitchUserID: { [sequelize_1.Op.like]: '%' + TwitchUserID + '%' } },
                order: [['Coins', 'DESC']], limit: 20
            });
        }
    }
    return bluebird_1.reject({ StreamerID });
}
exports.getAllWallets = getAllWallets;
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
    async update(newValue) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: newValue });
    }
}
exports.dbWalletManeger = dbWalletManeger;

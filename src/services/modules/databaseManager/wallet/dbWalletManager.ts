import dbManager from "../dbManager";
import { reject } from "bluebird";
import { Op } from "sequelize";

export async function getWallet(StreamerID: string, TwitchUserID: string) {
    let AccountData = dbManager.getAccountData(StreamerID);
    if (!AccountData) throw {
        RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
    }
    return (await AccountData.dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
}
export async function getAllWallets(StreamerID: string, TwitchUserID: string) {
    let AccountData = dbManager.getAccountData(StreamerID);
    if (!AccountData) throw { RequestError: 'The streamer did not initiate the extension' }

    if (TwitchUserID === '*') {
        return AccountData.dbWallets.findAll({ order: [['Coins', 'DESC']], limit: 20 });
    } else {
        return AccountData.dbWallets.findAll(
            {
                where: { TwitchUserID: { [Op.like]: '%' + TwitchUserID + '%' } },
                order: [['Coins', 'DESC']], limit: 20
            });
    }

}

/**
 * These classes include methods to manage Wallets in db
 */
export class dbWalletManager {
    private StreamerID: string;
    private TwitchUserID: string;
    constructor(StreamerID: string, TwitchUserID: string) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
    }

    async getWallet() {
        return getWallet(this.StreamerID, this.TwitchUserID);
    }

    async deposit(deposit: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins + ((deposit < 0) ? deposit * -1 : deposit) });
    }

    async withdraw(withdraw: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins - ((withdraw < 0) ? withdraw * -1 : withdraw) });
    }

    async update(newValue: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: newValue });
    }

    async updateLastMiningAttempt() {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ LastMiningAttempt: new Date });
    }
}


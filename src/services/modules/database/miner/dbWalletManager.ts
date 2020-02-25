import { dbStreamerManager } from "../dbStreamerManager";
import { reject } from "bluebird";
import { Op } from "sequelize";

export async function getWallet(StreamerID: string, TwitchUserID: string) {
    let AccountData = dbStreamerManager.getAccountData(StreamerID);
    if (!AccountData) return reject({
        RequestError: 'It was not possible to mine, as the streamer did not initiate an extension'
    })
    return (await AccountData.dbWallets.findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0];
}
export async function getAllWallets(StreamerID: string, TwitchUserID: string) {
    let AccountData = dbStreamerManager.getAccountData(StreamerID);
    if (AccountData) {

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
    return reject({ StreamerID });
}

/**
 * These classes include methods to manage Wallets in db
 */
export class dbWalletManeger {
    private StreamerID: string;
    private TwitchUserID: string;
    constructor(StreamerID: string, TwitchUserID: string) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
    }

    async getWallet() {
        return getWallet(this.StreamerID, this.TwitchUserID);
    }

    async  deposit(deposit: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins + deposit });
    }

    async  withdraw(withdraw: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: wallet.Coins - withdraw });
    }

    async update(newValue: number) {
        let wallet = await getWallet(this.StreamerID, this.TwitchUserID);
        return wallet.update({ Coins: newValue });
    }
}


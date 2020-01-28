import { dbStreamerManager } from "../dbStreamerManager";

export async function getWallet(StreamerID: string, TwitchUserID: string) {
    return (await dbStreamerManager.getAccountData(StreamerID).dbWallets
    .findOrCreate({ where: { TwitchUserID: TwitchUserID } }))[0]
}

/**
 * These classes include methods to manage Wallets in db
 */
export class WalletManeger {
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
}


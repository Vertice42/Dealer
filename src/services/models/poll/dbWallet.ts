import sequelize = require("sequelize");
import { Model } from "sequelize";

export class Wallet {
    TwitchUserID: string
    Coins: number
    LastMiningAttempt: Date

    constructor(TwitchUserID: string,Coins: number,LastMiningAttempt: Date) {
        this.TwitchUserID = TwitchUserID;
        this.Coins = Coins;
        this.LastMiningAttempt = LastMiningAttempt;
    }
}

export class dbWallet extends Model implements Wallet {
    TwitchUserID: string;
    Coins: number;
    LastMiningAttempt: Date;

    static toWallet(dbWallet: dbWallet) {
        return new Wallet(dbWallet.TwitchUserID, dbWallet.Coins, dbWallet.LastMiningAttempt)
    }

}

const WalletDefiner = {
    name: 'wallets',
    attributes: {
        TwitchUserID: {
            type: sequelize.CHAR(100),
            primaryKey: true
        },
        Coins: {
            type: sequelize.DOUBLE,
            defaultValue: 0
        },
        LastMiningAttempt: {
            type: sequelize.DATE,
            defaultValue: sequelize.NOW
        }
    },
    options: { timestamps: false }
}
export { WalletDefiner };



import sequelize = require("sequelize");
import { Model } from "sequelize";

export class Wallet {
    TwitchUserID: string
    Coins: number
    LastMiningAttemp: Date

    constructor(TwitchUserID: string,Coins: number,LastMiningAttemp: Date) {
        this.TwitchUserID = TwitchUserID;
        this.Coins = Coins;
        this.LastMiningAttemp = LastMiningAttemp;
    }
}

export class dbWallet extends Model implements Wallet {
    TwitchUserID: string;
    Coins: number;
    LastMiningAttemp: Date;

    static toWallet(dbWallet: dbWallet) {
        return new Wallet(dbWallet.TwitchUserID, dbWallet.Coins, dbWallet.LastMiningAttemp)
    }

}

const WalletDefiner = {
    Name: 'wallets',
    atributes: {
        TwitchUserID: {
            type: sequelize.STRING,
            primaryKey: true
        },
        Coins: {
            type: sequelize.DOUBLE,
            defaultValue: 0
        },
        LastMiningAttemp: {
            type: sequelize.DATE,
            defaultValue: sequelize.NOW
        }
    },
    options: { timestamps: false }
}
export { WalletDefiner };



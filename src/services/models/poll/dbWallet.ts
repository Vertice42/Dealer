import sequelize = require("sequelize");
import { Model } from "sequelize";

export class Wallet {
    TwitchUserID: string
    Coins: number
    LastMiningAttemp: number
}

export class dbWallet extends Model implements Wallet{
    TwitchUserID: string;   
    Coins: number;
    LastMiningAttemp: number;

}

const WalletDefiner = {
    Name:'wallets',
    atributes:{
        TwitchUserID: {
            type: sequelize.STRING,
            primaryKey: true
        },
        Coins: {
            type: sequelize.DOUBLE,
            defaultValue: 0
        },
        LastMiningAttemp: {
            type: sequelize.BIGINT
        }
    },
    options:{ timestamps: false }
}
export {WalletDefiner};



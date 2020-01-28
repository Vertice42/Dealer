import sequelize = require("sequelize");
import { Model } from "sequelize";
export class dbWallet extends Model {
    TwitchUserID: string
    Coins: number
    LastMiningAttemp: number
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



import sequelize = require("sequelize");
import { Model } from "sequelize";

export class Bettings {
    TwitchUserID: string;
    Bet: number;
    BetAmount: number;
}

export class dbBettings extends Model implements Bettings {
    TwitchUserID: string
    Bet: number
    BetAmount: number
}
export const BettingsDefiner = {
    TableName: '_bettings',
    atributes: {
        TwitchUserID: {
            type: sequelize.STRING,
            primaryKey: true
        },
        Bet: {
            type: sequelize.INTEGER
        },
        BetAmount: {
            type: sequelize.INTEGER
        }
    },
    options: { timestamps: false, freezeTableName: true }
}



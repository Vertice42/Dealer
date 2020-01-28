import sequelize = require("sequelize");
import { Model } from "sequelize";
export class dbBettings extends Model {
    TwitchUserID: string
    Bet: number
    BetAmount: number
}
export const BettingsDefiner = {
    TableName:'_bettings',
    atributes:{
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
    options:{ timestamps: false , freezeTableName: true}
}



import sequelize = require("sequelize");
import { Model } from "sequelize";

export class Bet {
    TwitchUserID: string;
    Bet: number;
    BetAmount: number;
    constructor(TwitchUserID: string, ChosenBetID: number, BetAmount: number) {
        this.TwitchUserID = TwitchUserID;
        this.Bet = ChosenBetID;
        this.BetAmount = BetAmount;
    }
}

export class dbBet extends Model implements Bet {
    TwitchUserID: string
    Bet: number
    BetAmount: number
}
export const BettingDefiner = {
    TableName: '_beatings',
    attributes: {
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



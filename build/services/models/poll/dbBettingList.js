"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbBettings extends sequelize_1.Model {
}
exports.dbBettings = dbBettings;
const BettingListDefiner = {
    name: '_bettings',
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
};
exports.BettingListDefiner = BettingListDefiner;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class Bettings {
}
exports.Bettings = Bettings;
class dbBettings extends sequelize_1.Model {
}
exports.dbBettings = dbBettings;
exports.BettingsDefiner = {
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
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbWallet extends sequelize_1.Model {
}
exports.dbWallet = dbWallet;
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
            type: sequelize.BIGINT
        }
    },
    options: { timestamps: false }
};
exports.WalletDefiner = WalletDefiner;

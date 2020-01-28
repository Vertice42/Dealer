"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbSettings extends sequelize_1.Model {
}
exports.dbSettings = dbSettings;
const SettingsDefiner = {
    name: 'settings',
    atributes: {
        RewardPerMinute: {
            type: sequelize.DOUBLE,
            defaultValue: 100
        }
    },
    options: { timestamps: false }
};
exports.SettingsDefiner = SettingsDefiner;

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
        SettingName: {
            type: sequelize.STRING,
            primaryKey: true
        },
        SettingsJson: {
            type: sequelize.JSON
        },
    }, options: {
        freezeTableName: true
    }
};
exports.SettingsDefiner = SettingsDefiner;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbButton extends sequelize_1.Model {
}
exports.dbButton = dbButton;
class dbButtonType {
}
exports.dbButtonType = dbButtonType;
const options = {
    freezeTableName: true
};
const tableName = '_poll';
const attributes = {
    ID: {
        type: sequelize.INTEGER,
        primaryKey: true
    },
    Name: { type: sequelize.STRING },
    IsWinner: { type: sequelize.BOOLEAN, defaultValue: false },
    Color: { type: sequelize.STRING }
};
const ButtonDefiner = { tableName, attributes, options };
exports.ButtonDefiner = ButtonDefiner;

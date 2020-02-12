"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbStore extends sequelize_1.Model {
}
exports.dbStore = dbStore;
exports.StoreDefiner = {
    name: 'store',
    atributes: {
        Type: {
            type: sequelize.INTEGER
        },
        Description: {
            type: sequelize.STRING,
            allowNull: false
        },
        Price: {
            type: sequelize.INTEGER
        }
    }, options: {
        freezeTableName: true
    }
};

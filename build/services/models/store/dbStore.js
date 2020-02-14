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
            type: sequelize.INTEGER,
            allowNull: true
        },
        Description: {
            type: sequelize.STRING,
            allowNull: true
        },
        Price: {
            type: sequelize.INTEGER,
            allowNull: true
        },
        FileName: {
            type: sequelize.STRING,
            allowNull: true
        }
    }, options: {
        freezeTableName: true
    }
};

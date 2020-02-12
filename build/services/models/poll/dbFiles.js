"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbFiles extends sequelize_1.Model {
}
exports.dbFiles = dbFiles;
exports.FilesDefiner = {
    name: 'files',
    atributes: {
        FileName: {
            type: sequelize.STRING,
            primaryKey: true
        }, StreamerID: {
            type: sequelize.STRING,
            allowNull: false
        },
        File: {
            type: sequelize.BLOB
        }
    }, options: {
        freezeTableName: true
    }
};
let a;

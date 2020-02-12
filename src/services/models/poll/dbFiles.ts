import sequelize = require("sequelize");
import { Model } from "sequelize";

export class dbFiles extends Model {
    FileName: string;
    StreamerID: unknown;
    File: [];
}

export const FilesDefiner = {
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
}

let a: sequelize.AttributeType
import sequelize = require("sequelize");
import { Model } from "sequelize";

export class dbFiles extends Model {
    Name: string;
    StreamerID: unknown;
    File:[];
}

export const FilesDefiner = {
    name: 'files',
    atributes: {
        Name: {
            type: sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        StreamerID:{
            type: sequelize.STRING,
            allowNull: false
        },
        File:{
            type: sequelize.BLOB
        }

    }, options: {
        freezeTableName: true
    }
}

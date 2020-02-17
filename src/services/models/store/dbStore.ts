import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";

export class dbStore extends Model implements StoreItem {
    id: number;
    Description: string;
    Price: number;
    FileName: string;
}

export const StoreDefiner = {
    name: 'store',
    atributes: {
        Description: {
            type: sequelize.STRING,
            allowNull: true
        },
        FileName: {
            type: sequelize.STRING,
            allowNull: true
        },
        Price: {
            type: sequelize.INTEGER,
            allowNull: true
        }

    }, options: {
        freezeTableName: true
    }
}

import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";

export class dbStore extends Model implements StoreItem {
    id: number; 
    Type: number;
    Description: string;
    Price: number;
}

export const StoreDefiner = {
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
        }

    }, options: {
        freezeTableName: true
    }
}

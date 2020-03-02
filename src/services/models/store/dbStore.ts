import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";
import ItemSettings from "./ItemSettings";

export class dbStore extends Model implements StoreItem {
    id: number;    
    Type: number;
    Description: string;
    ItemsSettings: ItemSettings[];
    ItemSettingsJson: string;
    FileName: string;
    Price: number;
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
        ItemSettingsJson: {
            type: sequelize.JSON,
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

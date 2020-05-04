import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";
import ItemSetting from "./item_settings/ItemSettings";

export class dbStoreItem extends Model implements StoreItem {
    id: number;
    Type: number;
    Description: string;
    ItemsSettingsJson: string;    
    ItemsSettings: ItemSetting[];
    FileName: string;
    Price: number;
}

export const StoreDefiner = {
    name: 'store',
    attributes: {
        Type: {
            type: sequelize.INTEGER
        },
        Description: {
            type: sequelize.STRING,
            allowNull: true
        },
        FileName: {
            type: sequelize.STRING,
            allowNull: true
        },
        ItemsSettingsJson: {
            type: sequelize.TEXT,
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

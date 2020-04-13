import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";
import ItemSetting from "./item_settings/ItemSettings";

export class dbStoreItem extends Model implements StoreItem {
    ItemsSettings: ItemSetting[];

    id: number;
    Type: number;
    Description: string;
    itemsSettings;
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
        ItemsSettings: {
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

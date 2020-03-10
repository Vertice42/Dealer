import sequelize = require("sequelize");
import { Model } from "sequelize";
import StoreItem from "./StoreItem";
import ItemSettings from "./item_settings/ItemSettings";

export class dbStoreItem extends Model implements StoreItem {
    id: number;
    Type: number;
    Description: string;
    ItemsSettings: ItemSettings[];
    ItemSettingsJson: string;
    FileName: string;
    Price: number;

    static ToStoreItem(dbStoreItem: dbStoreItem) {
        return new StoreItem(
            dbStoreItem.id,
            dbStoreItem.Type,
            dbStoreItem.Description,
            JSON.parse(dbStoreItem.ItemSettingsJson),
            dbStoreItem.FileName,
            dbStoreItem.Price)
    }
}

export const StoreDefiner = {
    name: 'store',
    atributes: {
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

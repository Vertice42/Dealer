import sequelize = require("sequelize");
import { Model } from "sequelize";
import PurchaseOrder from "./PurchaseOrder";

export class dbPurchaseOrder extends Model implements PurchaseOrder {
    id: number;
    SpentCoins: number;
    TwitchUserID: string;
    StoreItemID: number;
    updatedAt: Date;

    static toPurchaseOrder(dbPurchaseOrder:dbPurchaseOrder){
        return new PurchaseOrder(
            dbPurchaseOrder.SpentCoins,
            dbPurchaseOrder.TwitchUserID,
            dbPurchaseOrder.StoreItemID)
    }
}

export const PurchaseOrdersDefiner = {
    name: 'purchase_orders',
    attributes: {
        UserId: {
            type: sequelize.CHAR(100),
        },
        SpentCoins: {
            type: sequelize.INTEGER
        },
        TwitchUserID: {
            type: sequelize.CHAR(100),
        },
        StoreItemID: {
            type: sequelize.INTEGER,
        }
    }, options: {
        freezeTableName: true
    }
}

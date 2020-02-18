"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const sequelize_1 = require("sequelize");
class dbPurchaseOrder extends sequelize_1.Model {
}
exports.dbPurchaseOrder = dbPurchaseOrder;
exports.PurchaseOrdersDefiner = {
    name: 'purchase_orders',
    atributes: {
        UserId: {
            type: sequelize.STRING
        },
        SpentCoins: {
            type: sequelize.INTEGER
        },
        TwitchUserID: {
            type: sequelize.STRING
        },
        StoreItemID: {
            type: sequelize.INTEGER
        }
    }, options: {
        freezeTableName: true
    }
};

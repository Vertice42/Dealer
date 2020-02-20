"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
class dbPurchaseOrderManager {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
    }
    async addPurchaseOrder(PurchaseOrder) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
        return AccountData.dbPurchaseOrders.create(PurchaseOrder);
    }
    async removePurchaseOrder(PurchaseOrderID) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
        let dbPurchaseOrder = await AccountData.dbPurchaseOrders
            .findOne({ where: { id: PurchaseOrderID } });
        return dbPurchaseOrder.destroy();
    }
    async getAllPurchaseOrders() {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbPurchaseOrders.findAll();
    }
}
exports.default = dbPurchaseOrderManager;

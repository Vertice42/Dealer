import PurchaseOrder from "../../../models/store/PurchaseOrder";
import { dbPurchaseOrder } from "../../../models/store/dbPurchaseOrders";
import { resolve } from "bluebird";
import dbManager from "../dbManager";

export default class dbPurchaseOrderManager {
    private StreamerID: string;

    async getPurchaseOrderByStoreItemID(StoreItemID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return await AccountData.dbPurchaseOrders.findOne({ where: { StoreItemID: StoreItemID } });
    }

    async addPurchaseOrder(PurchaseOrder: PurchaseOrder) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return AccountData.dbPurchaseOrders.create(<dbPurchaseOrder>PurchaseOrder)
    }

    async removePurchaseOrder(PurchaseOrderID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbPurchaseOrder = await AccountData.dbPurchaseOrders
            .findOne({ where: { id: PurchaseOrderID } });
        if (!dbPurchaseOrder) return resolve();
        return dbPurchaseOrder.destroy();
    }

    async getAllPurchaseOrders(StoreItemID: number | string) {
        if (StoreItemID === '*')
            return dbManager.getAccountData(this.StreamerID).dbPurchaseOrders.findAll();
        else
            return dbManager.getAccountData(this.StreamerID).dbPurchaseOrders.findAll({ where: { StoreItemID: StoreItemID } });

    }

    async getPurchaseOrder(PurchaseOrderID: number) {
        return dbManager.getAccountData(this.StreamerID).dbPurchaseOrders
            .findOne({ where: { id: PurchaseOrderID } });
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
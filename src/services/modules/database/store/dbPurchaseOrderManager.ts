import { dbManager } from "../dbManager";
import PurchaseOrder from "../../../models/store/PurchaseOrder";
import { dbPurchaseOrder } from "../../../models/store/dbPurchaseOrders";

export default class dbPurchaseOrderManager {
    StreamerID: string;

    async getdbPurchaseOrderByStoreItemID(StoreItemID: number){
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return await AccountData.dbPurchaseOrders.findOne({ where: {StoreItemID: StoreItemID} });
    }

    async addPurchaseOrder(PurchaseOrder: PurchaseOrder) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return AccountData.dbPurchaseOrders.create(<dbPurchaseOrder>PurchaseOrder)
    }

    async removePurchaseOrder(PurchaseOrderID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbPurchaseOrder = await AccountData.dbPurchaseOrders
            .findOne({ where: { id: PurchaseOrderID } });
        return dbPurchaseOrder.destroy();
    }

    async getAllPurchaseOrders() {
        return dbManager.getAccountData(this.StreamerID).dbPurchaseOrders.findAll();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
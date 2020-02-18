import { dbStreamerManager } from "../dbStreamerManager";
import PurchaseOrder from "../../../models/store/PurchaseOrder";
import { dbPurchaseOrder } from "../../../models/store/dbPurchaseOrders";

export default class dbPurchaseOrderManager {
    StreamerID: string;

    async addPurchaseOrder(PurchaseOrder: PurchaseOrder) {
        let AccountData = dbStreamerManager.getAccountData(this.StreamerID);
        return AccountData.dbPurchaseOrders.create(<dbPurchaseOrder>PurchaseOrder)
    }

    async removePurchaseOrder(PurchaseOrder: PurchaseOrder) {
        let AccountData = dbStreamerManager.getAccountData(this.StreamerID);
        let dbPurchaseOrder = await AccountData.dbPurchaseOrders
            .findOne({ where: { id: PurchaseOrder.id } });
        return dbPurchaseOrder.destroy();
    }

    async getAllPurchaseOrders() {
        return dbStreamerManager.getAccountData(this.StreamerID).dbPurchaseOrders.findAll();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
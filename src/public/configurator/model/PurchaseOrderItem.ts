import StoreItem from "../../../services/models/store/StoreItem";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import { ViewPurchasedItem } from "../view/ViewPurchaseOrders";

export class PurchaseOrderItem {
    ViewPurchasedItem: ViewPurchasedItem;
    PurchaseOrder: PurchaseOrder;
    StoreItem: StoreItem;
    constructor(ViewPurchasedItem: ViewPurchasedItem, PurchaseOrder: PurchaseOrder, StoreItem: StoreItem) {
        this.ViewPurchasedItem = ViewPurchasedItem;
        this.PurchaseOrder = PurchaseOrder;
        this.StoreItem = StoreItem;
    }
}

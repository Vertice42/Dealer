"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeletePurchaseOrderRequest {
    constructor(StreamerID, TwitchUserID, PurchaseOrderID, StoreItemID, SpentCoins, Refund) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.PurchaseOrderID = PurchaseOrderID;
        this.StoreItemID = StoreItemID;
        this.SpentCoins = SpentCoins;
        this.Refund = Refund;
    }
}
exports.default = DeletePurchaseOrderRequest;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrderRequest {
    constructor(StreamerID, TwitchUserID, StoreItemID) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
    }
}
exports.default = PurchaseOrderRequest;

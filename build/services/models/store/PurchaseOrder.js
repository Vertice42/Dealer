"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrder {
    constructor(SpentCoins, TwitchUserID, StoreItemID, updatedAt) {
        this.SpentCoins = SpentCoins;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
        this.updatedAt = updatedAt;
    }
}
exports.default = PurchaseOrder;

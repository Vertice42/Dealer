"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrder {
    constructor(SpentCoins, TwitchUserID, StoreItemID) {
        this.SpentCoins = SpentCoins;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
    }
}
exports.default = PurchaseOrder;

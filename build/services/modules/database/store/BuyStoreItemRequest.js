"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BuyStoreItemRequest {
    constructor(StreamerID, TwitchUserID, StoreItem) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItem;
    }
}
exports.default = BuyStoreItemRequest;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StoreManagerRequest {
    constructor(StreamerID, StoreItem) {
        this.body = {
            StreamerID,
            StoreItem
        };
    }
}
exports.default = StoreManagerRequest;

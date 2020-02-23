"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WalletManagerRequest {
    constructor(StreamerID, TwitchUserID, newValue) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.newValue = newValue;
    }
}
exports.WalletManagerRequest = WalletManagerRequest;

export default class PurchaseOrderRequest {
    StreamerID: string
    TwitchUserID: string
    StoreItemID:number
    constructor(StreamerID: string, TwitchUserID: string, StoreItemID: number) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
    }
} 
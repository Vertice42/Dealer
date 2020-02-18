import StoreItem from "../../../models/store/StoreItem";

export default class BuyStoreItemRequest {
    StreamerID: string
    TwitchUserID: string
    StoreItemID:number
    constructor(StreamerID: string, TwitchUserID: string, StoreItem: number) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItem;
    }
} 
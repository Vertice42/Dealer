import StoreItem from "./StoreItem";

export default class StoreManagerRequest {
    StreamerID: string
    StoreItem: StoreItem
    constructor(StreamerID: string, StoreItem: StoreItem) {
        this.StreamerID = StreamerID;
        this.StoreItem = StoreItem;
    }
} 
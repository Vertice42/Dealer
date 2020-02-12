import StoreItem from "./StoreItem";

export default class StoreManagerRequest {
    body: {
        StreamerID: string
        StoreItem: StoreItem
    }
    constructor(StreamerID: string, StoreItem: StoreItem) {
        this.body = {
            StreamerID,
            StoreItem
        }
    }
} 
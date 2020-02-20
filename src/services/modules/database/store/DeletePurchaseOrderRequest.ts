import PurchaseOrderRequest from "./PurchaseOrderRequest";

export default class DeletePurchaseOrderRequest implements PurchaseOrderRequest {
    StreamerID: string
    TwitchUserID: string
    PurchaseOrderID: number
    StoreItemID: number
    SpentCoins: number
    Refund: boolean
    constructor(StreamerID: string, TwitchUserID: string, PurchaseOrderID: number
        , StoreItemID: number, SpentCoins: number, Refund: boolean, ) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.PurchaseOrderID = PurchaseOrderID;
        this.StoreItemID = StoreItemID;
        this.SpentCoins = SpentCoins;
        this.Refund = Refund;
    }
} 
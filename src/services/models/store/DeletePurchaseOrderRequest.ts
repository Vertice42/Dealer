import PurchaseOrderRequest from "./PurchaseOrderRequest";

export default class DeletePurchaseOrderRequest implements PurchaseOrderRequest {
    Token: string
    TwitchUserID: string
    PurchaseOrderID: number
    StoreItemID: number
    SpentCoins: number
    Refund: boolean
    constructor(Token: string, TwitchUserID: string, PurchaseOrderID: number, StoreItemID: number, SpentCoins: number, Refund: boolean, ) {
        this.Token = Token;
        this.TwitchUserID = TwitchUserID;
        this.PurchaseOrderID = PurchaseOrderID;
        this.StoreItemID = StoreItemID;
        this.SpentCoins = SpentCoins;
        this.Refund = Refund;
    }
} 
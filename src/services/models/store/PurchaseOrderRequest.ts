export default class PurchaseOrderRequest {
    Token: string
    TwitchUserID: string
    StoreItemID:number
    constructor(Token: string, TwitchUserID: string, StoreItemID: number) {
        this.Token = Token;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
    }
} 
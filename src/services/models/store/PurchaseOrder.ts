export default class PurchaseOrder {
    id: number;
    SpentCoins: number;
    TwitchUserID: string;
    StoreItemID: number;
    updatedAt: Date;
    constructor(SpentCoins: number,TwitchUserID: string,StoreItemID: number) {
        this.SpentCoins = SpentCoins;
        this.TwitchUserID = TwitchUserID;
        this.StoreItemID = StoreItemID;
    }
}
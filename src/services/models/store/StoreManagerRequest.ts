import StoreItem from "./StoreItem";

export default class StoreManagerRequest {
    Token: string
    StoreItem: StoreItem
    constructor(Token: string, StoreItem: StoreItem) {
        this.Token = Token;
        this.StoreItem = StoreItem;
    }
} 
export default class StoreItem {
    id: number;
    Type: number;
    Description: string;
    Price: number;
    /**
     *
     */
    constructor(ID: number,Type: number,Description: string,Price: number) {
        this.id = ID;
        this.Type = Type;
        this.Description = Description;
        this.Price = Price;
    }
}
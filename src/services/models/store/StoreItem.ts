export default class StoreItem {
    id: number;
    Description: string;
    Price: number;
    FileName:string
    /**
     *
     */
    constructor(ID: number,Type: number,Description: string,FileName:string,Price: number) {
        this.id = ID;
        this.Description = Description;
        this.FileName = FileName;
        this.Price = Price;
    }
}
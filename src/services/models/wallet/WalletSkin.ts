export class WalletSkin {
    Name:string;
    sku:string;
    ItIsFree:boolean;

    constructor(Name: string,sku: string,ItIsFree:boolean){
        this.Name = Name;
        this.sku = sku;
        this.ItIsFree = ItIsFree;
    }
}
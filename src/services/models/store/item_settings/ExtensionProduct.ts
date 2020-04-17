export default class ExtensionProduct {
    sku:string;
    description: string;
    ItIsFree: Boolean;

    constructor(sku:string, Description: string, ItIsFree: boolean) {
        this.sku = sku;
        this.description = Description;
        this.ItIsFree = ItIsFree;
    }
}
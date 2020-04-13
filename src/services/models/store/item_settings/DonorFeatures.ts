export default class DonorFeature {
    description: string;
    ItIsFree: Boolean;
    price: number;

    constructor(Description: string, ItIsFree: boolean, Price: number) {
        this.description = Description;
        this.ItIsFree = ItIsFree;
        this.price = Price;
    }
}
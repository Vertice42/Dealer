export default class DonorFeatures {
    name: string;
    description: string;
    itIsfree: Boolean;
    price: number;

    constructor(Name: string, Description: string, ItIsfree: boolean, Price: number) {
        this.name = Name;
        this.description = Description;
        this.itIsfree = ItIsfree;
        this.price = Price;
    }
}
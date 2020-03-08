import ItemSettings from "./ItemSettings";

export const StoreTypes = {
    Audio: 1
}

export default class StoreItem {
    id: number;
    Type:number;
    Description: string;
    ItemsSettings: ItemSettings[];
    ItemSettingsJson: string;
    FileName: string
    Price: number;
    /**
     *
     */
    constructor(ID: number, Type: number, Description: string, ItemsSettings = null, FileName: string, Price: number) {
        this.id = ID;
        this.Type = Type;
        this.Description = Description;
        this.FileName = FileName;
        this.ItemsSettings = ItemsSettings;
        this.Price = Price
    }
}
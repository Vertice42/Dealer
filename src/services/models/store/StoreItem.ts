import ItemSetting from "./item_settings/ItemSettings";

export const StoreTypes = {
    Audio: 1
}

export function getItemsSetting(SettingName: string,ItemsSettings:ItemSetting[]) {
    for (const ItemSetting of ItemsSettings) {
        if (ItemSetting.DonorFeatureName === SettingName)
            return ItemSetting;
    }
}

export default class StoreItem {
    id: number;
    Type: number;
    Description: string;
    ItemsSettings: ItemSetting[];
    FileName: string
    Price: number;

    constructor(ID: number, Type: number, Description: string, ItemsSettings = null, FileName: string, Price: number) {
        this.id = ID;
        this.Type = Type;
        this.Description = Description;
        this.FileName = FileName;
        this.ItemsSettings = ItemsSettings;
        this.Price = Price
    }
}
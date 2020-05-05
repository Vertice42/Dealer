import dbManager from "../dbManager";
import StoreItem, { StoreTypes } from "../../../models/store/StoreItem";
import { reject } from "bluebird";

export default class dbStoreManger {
    private StreamerID: string;

    async getAllItems() {
        let dbItems = await dbManager.getAccountData(this.StreamerID).dbStore.findAll();
        let Items = [];

        if (dbItems) {
            dbItems.forEach(Item => {
                Items.push(new StoreItem(Item.id, Item.Type, Item.Description,
                    JSON.parse(Item.ItemsSettingsJson), Item.FileName, Item.Price))
            })
        }
        return Items;
    }

    async get_dbItem(StoreItemID: number) {
        return dbManager.getAccountData(this.StreamerID).dbStore.findOne({ where: { id: StoreItemID } });
    }

    async getItem(StoreItemID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbStoreItem = await AccountData.dbStore.findOne({ where: { id: StoreItemID } });

        if (dbStoreItem) {
            return new StoreItem(dbStoreItem.id, dbStoreItem.Type, dbStoreItem.Description,
                JSON.parse(dbStoreItem.ItemsSettingsJson), dbStoreItem.FileName, dbStoreItem.Price);
        }
        return dbStoreItem;
    }

    async UpdateOrCreateStoreItem(StoreItem: StoreItem) {
        switch (StoreItem.Type) {
            case StoreTypes.Audio:
                {
                    if (!StoreItem.FileName) break;

                    let FileExtension = StoreItem.FileName.split('.').pop();
                    if (!(FileExtension === 'mp3' || FileExtension === 'wav')) {
                        return reject({ RequestError: `Invalid file "${FileExtension}"` })
                    }
                    break;
                }
        }

        if (StoreItem.ItemsSettings) {
            StoreItem.ItemsSettingsJson = JSON.stringify(StoreItem.ItemsSettings);
            StoreItem.ItemsSettings = null;
        }

        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbStoreItem = await this.get_dbItem(StoreItem.id);

        if (dbStoreItem) {
            await dbStoreItem.update(StoreItem);
            return { ItemUpdatedSuccessfully: new Date };
        }
        else {
            await AccountData.dbStore.create(StoreItem);
            return { SuccessfullyCreatedItem: new Date };
        }
    }

    async DeleteStoreItem(StoreItem: StoreItem) {
        return (await this.get_dbItem(StoreItem.id)).destroy();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
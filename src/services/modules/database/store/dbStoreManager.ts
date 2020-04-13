import { dbManager } from "../dbManager";
import StoreItem, { StoreTypes } from "../../../models/store/StoreItem";
import { reject } from "bluebird";

export default class dbStoreManger {
    private StreamerID: string;

    async getAllItems() {
        return dbManager.getAccountData(this.StreamerID).dbStore.findAll() || [];
    }

    async getItem(StoreItemID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return AccountData.dbStore.findOne({ where: { id: StoreItemID } });
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


        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbStoreItem = await AccountData.dbStore.findOne({ where: { id: StoreItem.id } });

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
        let dbStoreItem = await this.getItem(StoreItem.id);
        return dbStoreItem.destroy();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
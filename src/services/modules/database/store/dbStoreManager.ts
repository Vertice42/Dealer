import { dbManager } from "../dbManager";
import StoreItem, { StoreTypes } from "../../../models/store/StoreItem";
import { dbStoreItem as dbStoreIten, dbStoreItem } from "../../../models/store/dbStoreItem";
import { reject } from "bluebird";

export default class dbStoreManger {
    private StreamerID: string;

    async getAllItens() {        
        return dbManager.getAccountData(this.StreamerID).dbStore.findAll();
    }

    async getIten(StoreItemID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return AccountData.dbStore.findOne({ where: { id: StoreItemID } });
    }

    async UpdateOrCreateStoreItem(newStoreItem: StoreItem) {
        switch (newStoreItem.Type) {
            case StoreTypes.Audio:
                {
                    if(!newStoreItem.FileName) break;
                    
                    let FileExtension = newStoreItem.FileName.split('.').pop();
                    if (!(FileExtension === 'mp3' || FileExtension === 'wav')) {
                        return reject({ RequestError: `Invalid file "${FileExtension}"` })
                    }
                    break;
                }
        }


        let AccountData = dbManager.getAccountData(this.StreamerID);
        let dbStoreItem = await AccountData.dbStore.findOne({ where: { id: newStoreItem.id } });

        let newdbStoreIten = <dbStoreIten>newStoreItem;
        newdbStoreIten.ItemSettingsJson = JSON.stringify(newStoreItem.ItemsSettings);

        if (dbStoreItem) {
            await dbStoreItem.update(newdbStoreIten);
            return { ItemUpdatedSuccessfully: new Date };
        }
        else {
            await AccountData.dbStore.create(newdbStoreIten);
            return { SuccessfullyCreatedItem: new Date };
        }
    }

    async DeleteStoreItem(StoreItem: StoreItem) {
        let dbStoreItem = await this.getIten(StoreItem.id);
        return dbStoreItem.destroy();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}
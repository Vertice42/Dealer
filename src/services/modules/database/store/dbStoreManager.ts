import { dbManager } from "../dbManager";
import StoreItem from "../../../models/store/StoreItem";
import { dbStore as dbStoreIten, dbStore } from "../../../models/store/dbStore";

export default class dbStoreManger {
    StreamerID: string;

    async getAllItens() {
        return dbManager.getAccountData(this.StreamerID).dbStore.findAll();
    }

    async getIten(StoreItemID:number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        return AccountData.dbStore.findOne({ where: { id: StoreItemID } });
    }
    
    async UpdateOrCreateStoreItem(newStoreItem: StoreItem) {
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
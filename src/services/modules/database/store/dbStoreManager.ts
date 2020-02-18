import { dbStreamerManager } from "../dbStreamerManager";
import StoreItem from "../../../models/store/StoreItem";
import { dbStore as dbStoreIten, dbStore } from "../../../models/store/dbStore";

export default class dbStoreManger {
    StreamerID: string;

    async getAllItens() {
        return dbStreamerManager.getAccountData(this.StreamerID).dbStore.findAll();
    }

    async getIten(StoreItemID:number) {
        let AccountData = dbStreamerManager.getAccountData(this.StreamerID);
        return AccountData.dbStore.findOne({ where: { id: StoreItemID } });
    }
    
    async UpdateOrCreateStoreItem(StoreItem: StoreItem) {
        let AccountData = dbStreamerManager.getAccountData(this.StreamerID);
        let dbStoreItem = await AccountData.dbStore.findOne({ where: { id: StoreItem.id } });
        if (dbStoreItem) {
            await dbStoreItem.update(<dbStoreIten>StoreItem);
            return { ItemUpdatedSuccessfully: new Date };
        }
        else {
            await AccountData.dbStore.create(<dbStoreIten>StoreItem);
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
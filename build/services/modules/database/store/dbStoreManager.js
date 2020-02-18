"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
class dbStoreManger {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
    }
    async getAllItens() {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbStore.findAll();
    }
    async getIten(StoreItemID) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
        return AccountData.dbStore.findOne({ where: { id: StoreItemID } });
    }
    async UpdateOrCreateStoreItem(StoreItem) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
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
    async DeleteStoreItem(StoreItem) {
        let dbStoreItem = await this.getIten(StoreItem.id);
        return dbStoreItem.destroy();
    }
}
exports.default = dbStoreManger;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
class dbStoreManger {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
    }
    getAllItens() {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbStore.findAll();
    }
    UpdateOrCreateStoreItem(StoreItem) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID);
            let dbStoreItem = yield AccountData.dbStore.findOne({ where: { id: StoreItem.id } });
            if (dbStoreItem[0]) {
                yield dbStoreItem.update(StoreItem);
                return { ItemUpdatedSuccessfully: new Date };
            }
            else {
                yield AccountData.dbStore.create(StoreItem);
                return { SuccessfullyCreatedItem: new Date };
            }
        });
    }
}
exports.default = dbStoreManger;

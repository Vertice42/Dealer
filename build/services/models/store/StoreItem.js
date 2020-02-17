"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StoreItem {
    /**
     *
     */
    constructor(ID, Type, Description, FileName, Price) {
        this.id = ID;
        this.Description = Description;
        this.FileName = FileName;
        this.Price = Price;
    }
}
exports.default = StoreItem;

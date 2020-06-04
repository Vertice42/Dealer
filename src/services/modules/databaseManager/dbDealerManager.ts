import dbTransactionsOfUser, { TableName, Options, Attributes } from "../../models/dealer/dbPurchasesExtensionProducts";
import TransactionsOfUser from "../../models/dealer/StreamerDate";
import { dbDealer } from "./dbManager";

var dbPurchasesExtensionProductsTable: typeof dbTransactionsOfUser;

export default class dbDealerManager {
    ID: string;
    private PreparePromises: Promise<any>;

    private async Loading() {
        dbPurchasesExtensionProductsTable = <typeof dbTransactionsOfUser>
            dbDealer.define(TableName, Attributes, Options);
        return dbPurchasesExtensionProductsTable.sync();
    }

    async getTransactionsOfUser(ID = this.ID) {
        await this.PreparePromises;
        let dbTransactionsOfUser = await dbPurchasesExtensionProductsTable.findOne({ where: { ID: ID } });
        if (dbTransactionsOfUser) {
            dbTransactionsOfUser.TransactionsArray = JSON.parse(dbTransactionsOfUser.TransactionsArray);
        }
        return dbTransactionsOfUser;
    }
    async addTransactionOfUser(TransactionOfUser: TwitchExtBitsTransaction) {
        let dbTransactionOfUser = await this.getTransactionsOfUser();

        if (dbTransactionOfUser) {
            let newTransactionsOfUser = new TransactionsOfUser(this.ID, dbTransactionOfUser.TransactionsArray);
            newTransactionsOfUser.TransactionsArray.push(TransactionOfUser);
            newTransactionsOfUser.TransactionsArray = JSON.stringify(newTransactionsOfUser.TransactionsArray);
            return dbTransactionOfUser.update(newTransactionsOfUser);
        } else {
            let productsPurchasedByUser = new TransactionsOfUser(this.ID, [TransactionOfUser]);
            productsPurchasedByUser.TransactionsArray = JSON.stringify(productsPurchasedByUser.TransactionsArray);            
            return dbPurchasesExtensionProductsTable.create(productsPurchasedByUser);
        }
    }
    constructor(ID: string) {
        this.ID = ID;
        this.PreparePromises = this.Loading();
    }
}
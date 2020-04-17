import { dbManager } from "./dbManager";
import dbTransactionsOfUser, { TableName, Options, Attributes } from "../../models/dealer/dbPurchasesExtensionProducts";
import { Sequelize } from "sequelize/types";
import TransactionsOfUser from "../../models/dealer/StreamerDate";
import { resolve } from "bluebird";

var dbDealer: Sequelize;
var dbPurchasesExtensionProductsTable: typeof dbTransactionsOfUser;

export default class dbDealerManager {
    ID: string;
    private PreparePromises: Promise<any>;

    private async Loading() {
        if (dbDealer) return resolve();
        dbDealer = await dbManager.CreateIfNotExistSDataBase('Dealer');
        dbPurchasesExtensionProductsTable = <typeof dbTransactionsOfUser>dbDealer.define(TableName, Attributes, Options);
        return dbPurchasesExtensionProductsTable.sync();
    }
    async getTransactionsOfUser(ID = this.ID) {
        await this.PreparePromises;
        return dbPurchasesExtensionProductsTable.findOne({ where: { ID: ID } });
    }
    async addTransactionOfUser(TransactionOfUser: TwitchExtBitsTransaction) {
        let dbTransactionOfUser = await this.getTransactionsOfUser();
        if (dbTransactionOfUser) {
            let newTransactionsOfUser = new TransactionsOfUser
                (this.ID, dbTransactionOfUser.TransactionsArray);
            newTransactionsOfUser.TransactionsArray.push(TransactionOfUser);
            return dbTransactionOfUser.update(newTransactionsOfUser);
        } else {
            let productsPurchasedByUser = new TransactionsOfUser(this.ID, [TransactionOfUser]);
            return dbPurchasesExtensionProductsTable.create(productsPurchasedByUser);
        }
    }
    constructor(ID: string) {
        this.ID = ID;
        this.PreparePromises = this.Loading();
    }
}
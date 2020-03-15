import { dbManager } from "./dbManager";
import dbStreamerDate, { TableName, Options, Atributes } from "../../models/dealer/dbStreamerDate";
import { Sequelize } from "sequelize/types";
import StreamerDate from "../../models/dealer/StreamerDate";
import { resolve } from "bluebird";

var dbDealer: Sequelize;
var dbStreamerDataTable: typeof dbStreamerDate;

export default class dbDealerManager {
    StreamerID: string;
    private PreparePromisse: Promise<any>;

    private async Loading() {
        if (dbDealer) return resolve();
        dbDealer = await dbManager.CreateIfNotExistSDataBase('Dealer');
        dbStreamerDataTable = <typeof dbStreamerDate>dbDealer.define(TableName, Atributes, Options);
        return dbStreamerDataTable.sync();
    }
    async getStreamerData() {
        await this.PreparePromisse;
        return dbStreamerDataTable.findOne({ where: { StreamerID: this.StreamerID } });
    }
    async setStreamerData(StreamerDate: StreamerDate) {
        return (await this.getStreamerData()).update(StreamerDate);
    }
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.PreparePromisse = this.Loading();
    }
}


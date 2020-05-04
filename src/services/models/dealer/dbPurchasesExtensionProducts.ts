import TransactionsOfUser from "./StreamerDate";
import { ModelAttributes, ModelOptions, Model } from "sequelize";
import sequelize = require("sequelize");

export default class dbTransactionsOfUser extends Model implements TransactionsOfUser {
    ID: string;
    TransactionsArray: TwitchExtBitsTransaction[];
    TransactionsArrayJson: string;
}

const TableName = 'purchases';
const Attributes: ModelAttributes = {
    ID: {
        type: sequelize.STRING,
        primaryKey: true
    },
    TransactionsArray: sequelize.STRING
}

const Options: ModelOptions = {
    freezeTableName: true
}

export { TableName, Attributes, Options }
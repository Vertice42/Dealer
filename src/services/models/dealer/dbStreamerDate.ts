import StreamerDate from "./StreamerDate";
import { ModelAttributes, ModelOptions, Model } from "sequelize";
import sequelize = require("sequelize");

export default class dbStreamerDate extends Model implements StreamerDate {
    StreamerID: string;
    DonatedBeats: number;
    DateOfFirstDonation: Date;
    DateOflastDonation: Date;
}

const TableName = 'StreamerDataList';
const Atributes: ModelAttributes = {
    StreamerID: {
        type: sequelize.STRING,
        primaryKey: true
    },
    DonatedBeats: {
        type: sequelize.BIGINT,
        defaultValue: 0
    },
    DateOfFirstDonation: {
        type: sequelize.DATE,
        defaultValue: null,
        allowNull: true
    },
    DateOflastDonation: {
        type: sequelize.DATE,
        defaultValue: null,
        allowNull: true
    }
}

const Options: ModelOptions = {
    freezeTableName: true
}

export { TableName, Atributes, Options }
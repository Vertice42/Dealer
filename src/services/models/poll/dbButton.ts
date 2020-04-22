import sequelize = require("sequelize");
import { Model, ModelOptions, ModelAttributes } from "sequelize";
import { PollButton } from "./PollButton";
export class dbPollButton extends Model implements PollButton {
    ID: number
    Name: string
    Color: string
    IsWinner: boolean    
    Votes: number;
}

export class dbButtonType  {
    ID: number
    Name: string
    Color: string
    IsWinner: boolean
}

const options: ModelOptions = {
    freezeTableName: true

}
const tableName = '_poll';

const attributes: ModelAttributes = {
    ID: {
        type: sequelize.INTEGER,
        primaryKey: true
    },
    Name: { type: sequelize.STRING },
    IsWinner: { type: sequelize.BOOLEAN, defaultValue: false },
    Color: { type: sequelize.STRING }
}
const ButtonDefiner = { tableName, attributes, options }
export { ButtonDefiner }



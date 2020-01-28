import sequelize = require("sequelize");
import { Model, ModelOptions, ModelAttributes } from "sequelize";
export class dbButton extends Model {
    ID: number
    Name: string
    Color: string
    IsWinner: boolean
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



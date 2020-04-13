import sequelize = require("sequelize");
import { Model } from "sequelize";
export class dbSettings extends Model {
    SettingName:string;
    SettingsJson: unknown;
}
const SettingsDefiner = {
    name:'settings',
    attributes:{
        SettingName:{
            type: sequelize.STRING,
            primaryKey: true    
        },
        SettingsJson:{
            type: sequelize.JSON
        },
    },options:{
        freezeTableName: true
    }
}
export {SettingsDefiner};


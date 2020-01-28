import sequelize = require("sequelize");
import { Model } from "sequelize";
export class dbSettings extends Model {
    RewardPerMinute: number
}
const SettingsDefiner = {
    name:'settings',
    atributes:{
        RewardPerMinute: {
            type: sequelize.DOUBLE,
            defaultValue: 100
        }
    },
    options:{ timestamps: false }
}
export {SettingsDefiner};


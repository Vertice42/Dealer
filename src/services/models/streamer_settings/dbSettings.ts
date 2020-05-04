import sequelize = require("sequelize");
import { Model } from "sequelize";

export class DealerSettings {
    SettingName: string;
    SettingsJson: string;
    constructor(SettingName: string,SettingsObject:Object) {
        this.SettingName = SettingName;
        this.SettingsJson = JSON.stringify(SettingsObject);
    }
}

export class dbDealerSettings extends Model implements DealerSettings {
    SettingName: string;
    SettingsJson: string;
}
const SettingsDefiner = {
    name: 'settings',
    attributes: {
        SettingName: {
            type: sequelize.CHAR(100),
            primaryKey: true
        },
        SettingsJson: {
            type: sequelize.TEXT
        },
    }, options: {
        freezeTableName: true
    }
}
export { SettingsDefiner };


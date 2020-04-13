import DonorFeature from "../models/store/item_settings/DonorFeatures";
import dbDealerManager from "../modules/database/dbDealerManager";
import ItemSetting from "../models/store/item_settings/ItemSettings";
import fs = require('fs');
import path = require('path');

export default class ControllerOfPermissions {
    private StreamerID: string;
    async StreamerIsDonor() {
        let StreamerData = await new dbDealerManager(this.StreamerID).getStreamerData();
        return (StreamerData) ? (StreamerData.DonatedBeats > 0) : false;
    }
    async FeaturesIsLocked(DonorFeatures: DonorFeature) {
        if (DonorFeatures.ItIsFree) return false;

        let StreamerData = await new dbDealerManager(this.StreamerID).getStreamerData();

        return (StreamerData) ? (StreamerData.DonatedBeats >= DonorFeatures.price) : true;
    }

    async AllSettingsISLocked(ItemsSettings: ItemSetting[]) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve('./configs/DonorFeatures.json'), "utf8", async (ERROR, data) => {
                if (ERROR) return reject(ERROR);

                let DonorFeatures: DonorFeature[] = JSON.parse(data);
                let donorFeatureKeys = Object.keys(DonorFeatures);

                let AllSettingsISLocked = false;

                for (const itemsSetting of ItemsSettings) {
                    for (let i = 0; i < donorFeatureKeys.length; i++) {
                        if (await this.FeaturesIsLocked(DonorFeatures[donorFeatureKeys[i]])
                            && itemsSetting.Enable) {
                            AllSettingsISLocked = true;
                            return resolve(AllSettingsISLocked);
                        }
                    }
                    return resolve(AllSettingsISLocked);
                }

        })
    })
}

    constructor(StreamerId: string) {
        this.StreamerID = StreamerId;
    }
}
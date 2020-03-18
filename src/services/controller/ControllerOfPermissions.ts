import DonorFeatures from "../models/store/item_settings/DonorFeatures";
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
    async FeaturesIsLocked(DonorFeatures: DonorFeatures) {
        if (DonorFeatures.itIsfree) return false;

        let StreamerData = await new dbDealerManager(this.StreamerID).getStreamerData();
        
        return (StreamerData) ? (StreamerData.DonatedBeats >= DonorFeatures.price) : true;
    }

    async AllSettingsISLocked(ItemsSettings: ItemSetting[]) {
        return new Promise((resolve, reject) => {
            //TODO MDAR PATH EM MODO PRODUTION            
            fs.readFile(path.resolve('./src/services/configs/DonorFeatures.json'), "utf8", async (ERROR, data) => {
                if (ERROR) return reject(ERROR);

                let DonorFeatures: DonorFeatures[] = JSON.parse(data);
                let AllSettingsISLocked = false;

                for (const ItemsSetting of ItemsSettings) {

                    let donorFeature = DonorFeatures[DonorFeatures.findIndex(DonorFeature => {
                        if (DonorFeature.name === ItemsSetting.DonorFeatureName) return true;
                    })]

                    if (await this.FeaturesIsLocked(donorFeature) && ItemsSetting.Enable) {
                        AllSettingsISLocked = true;
                        return resolve(AllSettingsISLocked);
                    }
                }

                return resolve(AllSettingsISLocked);
            })
        })
    }

    constructor(StreamerId: string) {
        this.StreamerID = StreamerId;
    }
}
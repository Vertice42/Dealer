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
    async FeaturesIsUnlocked(DonorFeatures: DonorFeatures) {        
        if(DonorFeatures.itIsfree) return true;

        let StreamerData = await new dbDealerManager(this.StreamerID).getStreamerData();
        return (StreamerData) ? (StreamerData.DonatedBeats >= DonorFeatures.price) : false;
    }

    async CheckForLockedSettings(ItemsSettings: ItemSetting[]) {
        return new Promise((resolve, reject) => {
            //TODO MDAR PATH EM MODO PRODUTION            
            fs.readFile(path.resolve('./src/services/configs/DonorFeatures.json'), "utf8", async (err, data) => {
                if (err) return reject(err);
    
                let DonorFeatures: DonorFeatures[] = JSON.parse(data);
                let AllItemsSettingsIsUnlocked = true;
                for (const ItemsSetting of ItemsSettings) { 
                    let donorFeature = DonorFeatures[DonorFeatures.findIndex(DonorFeature => {                        
                        if (DonorFeature.name === ItemsSetting.DonorFeatureName) return true;
                    })]
                    
                    if (await this.FeaturesIsUnlocked(donorFeature) && ItemsSetting.Enable) {
                        AllItemsSettingsIsUnlocked = false;
                        return resolve(AllItemsSettingsIsUnlocked);
                    }
                }
                return resolve(AllItemsSettingsIsUnlocked);
            })
        })
    }

    constructor(StreamerId: string) {
        this.StreamerID = StreamerId;
    }
}
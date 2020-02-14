"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbStreamerManager_1 = require("../dbStreamerManager");
const dbLoading_1 = require("../dbLoading");
const bluebird_1 = require("bluebird");
const MinerSettings_1 = require("../../../models/miner/MinerSettings");
const CoinsSettings_1 = require("../../../models/streamer_settings/CoinsSettings");
class StreamerSettings {
    /**
     *
     * @param StreamerID
     */
    static async getMinerSettings(StreamerID) {
        let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        if (!accountData.MinerSettings)
            return dbLoading_1.Loading.MinerSettings(StreamerID);
        return bluebird_1.resolve(accountData.MinerSettings);
    }
    /**
     *
     * @param StreamerID
     */
    static async getCoinsSettings(StreamerID) {
        let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        if (!accountData.CoinsSettings)
            return dbLoading_1.Loading.CoinsSettings(StreamerID);
        return bluebird_1.resolve(accountData.CoinsSettings);
    }
    /**
     *
     * @param StreamerID
     * @param minerSettings
     */
    static async UpdateMinerSettings(StreamerID, NewMinerSettings) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        AccountData.MinerSettings = NewMinerSettings;
        return AccountData.dbSettings.update({ SettingsJson: NewMinerSettings }, { where: { SettingName: MinerSettings_1.MinerSettings.name } })
            .then((res) => {
            console.log(res);
            return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
        }).catch((rej) => {
            console.log(rej);
        });
    }
    /**
     *
     * @param StreamerID
     * @param minerSettings
     */
    static async UpdateCoinsSettings(StreamerID, NewCoinsSettings) {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
        AccountData.CoinsSettings = NewCoinsSettings;
        return AccountData.dbSettings.update(NewCoinsSettings, { where: { SettingName: CoinsSettings_1.CoinsSettings.name } })
            .then(() => {
            return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
        });
    }
}
exports.default = StreamerSettings;

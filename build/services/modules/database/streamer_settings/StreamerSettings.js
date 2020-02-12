"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    static getMinerSettings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            if (!accountData.MinerSettings)
                return dbLoading_1.Loading.MinerSettings(StreamerID);
            return bluebird_1.resolve(accountData.MinerSettings);
        });
    }
    /**
     *
     * @param StreamerID
     */
    static getCoinsSettings(StreamerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            if (!accountData.CoinsSettings)
                return dbLoading_1.Loading.CoinsSettings(StreamerID);
            return bluebird_1.resolve(accountData.CoinsSettings);
        });
    }
    /**
     *
     * @param StreamerID
     * @param minerSettings
     */
    static UpdateMinerSettings(StreamerID, NewMinerSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            AccountData.MinerSettings = NewMinerSettings;
            return AccountData.dbSettings.update(NewMinerSettings, { where: { SettingName: MinerSettings_1.MinerSettings.name } })
                .then(() => {
                return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
        });
    }
    /**
     *
     * @param StreamerID
     * @param minerSettings
     */
    static UpdateCoinsSettings(StreamerID, NewCoinsSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamerID);
            AccountData.CoinsSettings = NewCoinsSettings;
            return AccountData.dbSettings.update(NewCoinsSettings, { where: { SettingName: CoinsSettings_1.CoinsSettings.name } })
                .then(() => {
                return bluebird_1.resolve({ SuccessfullyUpdatedMinerSettings: AccountData.MinerSettings });
            });
        });
    }
}
exports.default = StreamerSettings;

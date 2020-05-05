import { expect } from "chai";
import { createStreamerTables, deleteStreamerTables, ID_FOR_SETTINGS, HOURLY_REWARD_FOR_TEST } from "./ForTests.test";
import { MinerSettings } from "../services/models/streamer_settings/MinerSettings";
import { CoinsSettings } from "../services/models/streamer_settings/CoinsSettings";
import StreamerSettingsManager from "../services/modules/databaseManager/streamer_settings/StreamerSettingsManager";

describe('Settings', () => {
    before(async () => {
        await createStreamerTables(ID_FOR_SETTINGS);
    })
    after(async () => {
        await deleteStreamerTables(ID_FOR_SETTINGS);
    })
    describe('Miner', async function () {
        it('Get Miner Settings', async function () {
            expect(await StreamerSettingsManager.getMinerSettings(ID_FOR_SETTINGS))
            .to.deep.equal(new MinerSettings(0.2));
        })

        it('Update Miner Settings', async function () {
            let minerSettings = new MinerSettings(HOURLY_REWARD_FOR_TEST);

            let UpdateMinerResult = await StreamerSettingsManager.UpdateMinerSettings(ID_FOR_SETTINGS, minerSettings);

            expect(UpdateMinerResult).to.deep.include({ SuccessfullyUpdatedMinerSettings: minerSettings })

            let MinerSettingsResult = await StreamerSettingsManager.getMinerSettings(ID_FOR_SETTINGS);
            expect(MinerSettingsResult).to.deep.equal(minerSettings);

        })
    })
    describe('Coins', async function () {
        let CoinsSettingsForTest: CoinsSettings;
        before(async () => {
            CoinsSettingsForTest = new CoinsSettings('CoinTest', 'Coins.png');
            await StreamerSettingsManager.UpdateOrCreateCoinsSettings(ID_FOR_SETTINGS, CoinsSettingsForTest);
        })
        it('Get Coins Settings', async function () {
            let CoinsSettings = await StreamerSettingsManager.getCoinsSettings(ID_FOR_SETTINGS);
            expect(CoinsSettings).to.deep.equal(CoinsSettingsForTest);
        })

        it('Update Coins Settings', async function () {
            let newCoinsSettings = new CoinsSettings('fon', 'test.png');
            await StreamerSettingsManager.UpdateOrCreateCoinsSettings(ID_FOR_SETTINGS, newCoinsSettings);
            expect(newCoinsSettings).to.deep.equal(await StreamerSettingsManager.getCoinsSettings(ID_FOR_SETTINGS));
        })
    })

})
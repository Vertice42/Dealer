import { expect } from "chai";

import { createStreamerTables, ID_FOR_MINING, deleteStreamerTables, USERS_IDS_FOR_TESTS, REWARD_FOR_TEST_ATTEMPT, HOURLY_REWARD_FOR_TEST } from "./ForTests.test";
import { sleep } from "../services/utils/functions";
import { MinerSettings } from "../services/models/streamer_settings/MinerSettings";
import StreamerSettingsManager from "../services/modules/databaseManager/streamer_settings/StreamerSettingsManager";
import MinerManager from "../services/modules/databaseManager/miner/dbMinerManager";

describe('Mining', () => {

  before(async () => {
    await createStreamerTables(ID_FOR_MINING);
    await StreamerSettingsManager.UpdateMinerSettings(ID_FOR_MINING,new MinerSettings(HOURLY_REWARD_FOR_TEST));
  })
  after(async () => {
    await deleteStreamerTables(ID_FOR_MINING)
  })

  it('Mining Coins', async function () {
    this.timeout(6000)
    this.slow(3000);
    let result1 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);        
    expect(result1.CoinsOfUser).to.deep.equal(0);
    
    await sleep(result1.MinimumTimeToMine);

    let result2 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);

    expect(Math.round(result2.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

    let result3 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);
    expect(Math.round(result3.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

  })

})
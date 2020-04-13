import { expect } from "chai";

import MinerManager from "../services/modules/database/miner/dbMinerManager";
import { createAndStartStreamerDatabase, ID_FOR_MINING, deleteStreamerDatabase, USERS_IDS_FOR_TESTS, REWARD_FOR_TEST_ATTEMPT, HOURLY_REWARD_FOR_TEST } from "./ForTests.test";
import { sleep } from "../utils/functions";
import StreamerSettingsManager from "../services/modules/database/streamer_settings/StreamerSettingsManager";
import { MinerSettings } from "../services/models/streamer_settings/MinerSettings";

describe('Mining', () => {

  before(async () => {
    await createAndStartStreamerDatabase(ID_FOR_MINING);
    await StreamerSettingsManager.UpdateMinerSettings(ID_FOR_MINING,new MinerSettings(HOURLY_REWARD_FOR_TEST));
  })
  after(async () => {
    await deleteStreamerDatabase(ID_FOR_MINING)
  })

  it('Mining Coins', async function () {
    this.slow(1500);
    let result1 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);        
    expect(result1.CoinsOfUser).to.deep.equal(0);
    
    await sleep(result1.MinimumTimeToMine);

    let result2 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);

    expect(Math.round(result2.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

    let result3 = await MinerManager.MineCoin(ID_FOR_MINING, USERS_IDS_FOR_TESTS[0]);
    expect(Math.round(result3.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

  })

})
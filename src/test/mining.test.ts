import { expect } from "chai";
import { sleep } from "../utils/utils";

import { MINIMUN_TIME_FOR_MINING } from "../services/models/streamer_settings/MinerSettings";
import MinerManeger from "../services/modules/database/miner/dbMinerManager";
import { createAndStartStreamerDatabase, ID_FOR_MINIG, deleteStreamerDatabase, USERS_IDS_FOR_TESTS, REWARD_FOR_TEST_ATTEMPT } from "./ForTests.test";

describe('Mining', () => {

  before(async () => {
    await createAndStartStreamerDatabase(ID_FOR_MINIG);
  })
  after(async () => {
    await deleteStreamerDatabase(ID_FOR_MINIG)
  })

  it('Mining Coins', async function () {
    this.slow(1500);
    let result1 = await MinerManeger.MineCoin(ID_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);    

    expect(result1.CoinsOfUser).to.deep.equal(0);

    await sleep(result1.MinimumTimeToMine);

    let result2 = await MinerManeger.MineCoin(ID_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
    expect(Math.round(result2.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

    let result3 = await MinerManeger.MineCoin(ID_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
    expect(Math.round(result3.CoinsOfUser)).to.deep.equal(Math.round(REWARD_FOR_TEST_ATTEMPT));

  })

})
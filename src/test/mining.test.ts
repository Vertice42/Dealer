import { expect } from "chai";

import { sleep } from "../utils/utils";

import StreamerSettingsManager from "../services/modules/database/streamer_settings/StreamerSettingsManager";
import { MinerSettings, MINIMUN_TIME_FOR_MINING } from "../services/models/miner/MinerSettings";
import MinerManeger from "../services/modules/database/miner/dbMinerManager";
import { createStreamerDatabase, ID_FOR_MINIG, deleteStreamerDatabase, USERS_IDS_FOR_TESTS, REWARD_FOR_TEST_ATTEMPT } from "./ForTests.test";

describe('Mining', () => {

    before(async () => {
      await createStreamerDatabase(ID_FOR_MINIG);
    })
    after(async () => {
      await deleteStreamerDatabase(ID_FOR_MINIG)
    })

    it('Mining Coins', async function () {
      this.slow(1500);
      let result1 = await MinerManeger.MineCoin(ID_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
      expect(result1).to.include({ CoinsOfUser: REWARD_FOR_TEST_ATTEMPT })

      await sleep(MINIMUN_TIME_FOR_MINING);

      let result2 = await MinerManeger.MineCoin(ID_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
      expect(result2).to.include({ CoinsOfUser: REWARD_FOR_TEST_ATTEMPT * 2 })

    })

  })
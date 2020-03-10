import { PollButton } from "../services/models/poll/PollButton";
import { MinerSettings } from "../services/models/streamer_settings/MinerSettings";
import { PollController } from "../services/controller/PollController";
import { Loading } from "../services/modules/database/dbLoading";
import { dbManager } from "../services/modules/database/dbManager";

export const USERS_IDS_FOR_TESTS = ['jukes', 'lato', 'naruto', 'saske', 'bankai'];

export const db_PRE_CREATED = 'dava';

export const ID_FOR_MANAGER_POLL = 'amaterasu';
export const db_FOR_UPDATE_BUTTONS = 'lapis';
export const ID_FOR_DISTRIBUITION = 'perola';
export const ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS = 'quark';
export const ID_FOR_CREATE = 'jasper';
export const ID_FOR_MINIG = 'peridote';
export const ID_FOR_STORE = 'corona';
export const ID_FOR_PURCHASE_ORDER = 'bankay';
export const ID_FOR_SETTINGS = 'whithe';
export const ID_FOR_WALLETS = 'rahast'

export const HOURLY_REWARD_FOR_TEST = 102;
export const REWARD_FOR_TEST_ATTEMPT = new MinerSettings(HOURLY_REWARD_FOR_TEST).RewardPerMining;

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createAndStartStreamerDatabase(StreamersID: string) {
  let CreateResult = await dbManager.CreateIfNotExistStreamerDataBase(StreamersID);
  dbManager.setAccountData(await Loading.StreamerAccountData(StreamersID));
  return CreateResult;
}

export async function deleteStreamerDatabase(StreamersID: string) {
  return dbManager.DeleteStreamerDataBase(StreamersID);
}

export async function createPoll(StreamersID: string) {
  return new PollController(StreamersID).CreatePoll()
}

export async function startPoll(StreamersID: string) {
  let AccountData = dbManager.getAccountData(StreamersID);
  AccountData.CurrentPollStatus.PollStarted = true;
  return new PollController(StreamersID).UpdatePoll([
    new PollButton(0, 'wait', '#FFFFFF', false),
    new PollButton(1, 'black', '#000000', false)])
}

// TODO REALOCAR CARIAVECEIS
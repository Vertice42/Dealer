import { PollButton } from "../services/models/poll/PollButton";
import { MinerSettings } from "../services/models/streamer_settings/MinerSettings";
import { Loading } from "../services/modules/database/dbLoading";
import { dbManager } from "../services/modules/database/dbManager";
import { PollStatus } from "../services/models/poll/PollStatus";
import PollController from "../services/controller/PollController";

export const USERS_IDS_FOR_TESTS = ['jukes', 'jato', 'naruto', 'saske', 'bankai'];

export const ID_FOR_MANAGER_POLL = 'amaterasu';
export const db_FOR_UPDATE_BUTTONS = 'lapis';
export const ID_FOR_DISTRIBUTION = 'perola';
export const ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS = 'quark';
export const ID_FOR_CREATE = 'jasper';
export const ID_FOR_MINING = 'peridot';
export const ID_FOR_STORE = 'corona';
export const ID_FOR_PURCHASE_ORDER = 'bankay';
export const ID_FOR_SETTINGS = 'white';
export const ID_FOR_WALLETS = 'rhaast'

export const HOURLY_REWARD_FOR_TEST = 60;
export const REWARD_FOR_TEST_ATTEMPT = new MinerSettings(HOURLY_REWARD_FOR_TEST).RewardPerMining;

export async function createAndStartStreamerDatabase(StreamersID: string) {
  let CreateResult = await dbManager.CreateIfNotExistStreamerDataBase(StreamersID);
  dbManager.setAccountData(await Loading.StreamerAccountData(StreamersID));
  return CreateResult;
}

export async function deleteStreamerDatabase(StreamersID: string) {
  return dbManager.DeleteStreamerDataBase(StreamersID);
}

export async function createPoll(StreamersID: string) {
  return new PollController(StreamersID).CreatePoll(new PollStatus())
}

export async function startPoll(StreamersID: string) {
  let PollC = new PollController(StreamersID);
  return PollC.UpdatePoll((await PollC.getCurrentPollStatus()).start(), [
    new PollButton(0, 'wait', '#FFFFFF', false),
    new PollButton(1, 'black', '#000000', false)])
}
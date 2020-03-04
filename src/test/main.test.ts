import { expect } from "chai";
import { resolve } from "bluebird";
import { PollStatus } from "../services/models/poll/PollStatus";
import { PollButton } from "../services/models/poll/PollButton";
import { Poll } from "../services/models/poll/Poll";
import { MinerSettings, MINIMUN_TIME_FOR_MINING } from "../services/models/miner/MinerSettings";
import { getWallet, dbWalletManeger } from "../services/modules/database/miner/dbWalletManager";
import { dbWallet } from "../services/models/poll/dbWallet";
import { PollController } from "../services/controller/PollController";
import { PollBeat } from "../services/models/poll/PollBeat";
import { dbManager } from "../services/modules/database/dbManager";
import { Loading } from "../services/modules/database/dbLoading";
import StreamerSettings from "../services/modules/database/streamer_settings/StreamerSettings";
import MinerManeger from "../services/modules/database/miner/dbMinerManager";

const USERS_IDS_FOR_TESTS = ['jukes', 'lato', 'naruto', 'saske', 'bankai'];

const ID_FOR_MANAGER_POLL = 'amaterasu';
const db_FOR_UPDATE_BUTTONS = 'lapis';
const ID_FOR_DISTRIBUITION = 'perola';
const ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS = 'quark';
const ID_FOR_CREATE = 'jasper';
const db_FOR_MINIG = 'peridote';
const db_PRE_CREATED = 'dava';

const HOURLY_REWARD_FOR_TEST = 102;
const REWARD_FOR_TEST_ATTEMPT = new MinerSettings(HOURLY_REWARD_FOR_TEST).RewardPerMining;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createDatabase(StreamersID: string) {
  let CreateResult = await dbManager.CreateIfNotExistStreamerDataBase(StreamersID);  
  await Loading.StreamerDatabase(StreamersID);
  return CreateResult;
}

async function deleteDatabse(StreamersID: string) {
  return dbManager.DeleteStreamerDataBase(StreamersID);
}

async function createPoll(StreamersID: string) {
  return new PollController(StreamersID).CreatePoll()
}

async function startPoll(StreamersID: string) {
  let AccountData = dbManager.getAccountData(StreamersID);
  AccountData.CurrentPollStatus.PollStarted = true;
  return new PollController(StreamersID).UpdatePoll([
    new PollButton(0, 'wait', '#FFFFFF', false),
    new PollButton(1, 'black', '#000000', false)])
}

describe('DATABASE_MANAGER', () => {
  after(async () => { await deleteDatabse(ID_FOR_CREATE) })

  it('CreateStreamerDataBase', async function () {
    expect(await createDatabase(ID_FOR_CREATE)).to.include.keys('StreamerDataBaseCreated');
  });

  describe('Poll', () => {
    before(async function () {
      await createDatabase(ID_FOR_MANAGER_POLL);
    });
    after(async function () {
      await deleteDatabse(ID_FOR_MANAGER_POLL);
    })

    it('Load poll already created in db already created', async function () {
      let Poll = await new PollController(db_PRE_CREATED).getCurrentPoll();      
      expect(Poll.PollStatus).to.deep.equal(new PollStatus().start().stop());
      expect(Poll.PollButtons).to.deep.equal([
        new PollButton(0, '', '#3aa555', true),
        new PollButton(1, '', '#fa2500', false)]);
      expect(Poll.Bets).to.deep.equal([]);

    })

    it('First Get Poll', async function () {
      expect((await new PollController(ID_FOR_MANAGER_POLL).getCurrentPoll()).PollStatus)
        .to.deep.equal(new PollStatus().waxe());
    })

    it('CreatePoll', async function () {
      expect(await new PollController(ID_FOR_MANAGER_POLL).CreatePoll()).to.include.keys('PollCreated');
    })

    var ButtonsToTest = [];
    it('Start Poll', async function () {
      let AccountData = dbManager.getAccountData(ID_FOR_MANAGER_POLL);
      AccountData.CurrentPollStatus.start();

      ButtonsToTest.push(new PollButton(0, 'waite', '#FFFFFF', false))
      ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))

      let UpdatePollResult = await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(ButtonsToTest)

      expect(UpdatePollResult.UpdatePollStatusRes).to.include({ PollStarted: true });
      expect(UpdatePollResult.UpdateButtonGroupRes).to.include(
        { CreatedButtons: 2, UpdatedButtons: 0, DeletedButtons: 0 });
    })

    it('Get Poll', async function () {
      let poll: Poll = await new PollController(ID_FOR_MANAGER_POLL).getCurrentPoll();

      let PollForTest = new PollStatus();
      PollForTest.PollStarted = true;

      expect(poll.PollStatus).to.deep.equal(PollForTest);
      expect(poll.PollButtons).to.deep.equal(ButtonsToTest);

    })

    describe('Update Buttons', function () {
      this.timeout(4000);

      before(async function () {
        await createDatabase(db_FOR_UPDATE_BUTTONS);
        await createPoll(db_FOR_UPDATE_BUTTONS);
        await startPoll(db_FOR_UPDATE_BUTTONS);
      })
      after(async () => {
        await deleteDatabse(db_FOR_UPDATE_BUTTONS);
      })

      it('Modify buttons', async function () {
        this.slow(300);
        await sleep(500);

        let ButtonsToTest = [];
        //ButtonsToTest.push(new PollButton(0,'waite','#FFFFFF',false))   // DELETE
        ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))
        ButtonsToTest.push(new PollButton(2, 'black', '#000020', false))
        ButtonsToTest.push(new PollButton(3, 'wait', '#FFFFFF', false))  // NEW

        let pollController = new PollController(db_FOR_UPDATE_BUTTONS);


        expect((await pollController.UpdatePoll(ButtonsToTest)).UpdateButtonGroupRes).to.include(
          { CreatedButtons: 2, UpdatedButtons: 1, DeletedButtons: 1 });

        let poll = await pollController.getCurrentPoll();

        let pollForComper = new Poll(
          new PollStatus().start(),
          ButtonsToTest,
          new Date().getTime(),
          undefined, []);

        expect(poll.PollStatus).to.deep.equal(pollForComper.PollStatus);
        expect(poll.PollButtons).to.deep.equal(pollForComper.PollButtons);
        expect(poll.Bets).to.deep.equal(pollForComper.Bets);
      })

    })

    it('Stop Poll', async function () {
      dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.stop();

      expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollStarted: true, PollStoped: true });

    });

    it('Restart Poll', async function () {
      dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.restart();

      expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollStarted: true, PollStoped: false });
    });

    it('Waxe Poll', async function () {
      dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.waxe();

      expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollWaxed: true });
    })

    describe('Distribution', function () {
      this.timeout(6000);

      before(async () => {
        await createDatabase(ID_FOR_DISTRIBUITION);
        await createPoll(ID_FOR_DISTRIBUITION);
        await startPoll(ID_FOR_DISTRIBUITION);

        await new dbWalletManeger(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[0]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[1]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[2]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[3]).deposit(50);

        ///////////////////////////////////////////////////////////////////////////////

        await createDatabase(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
        await createPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
        await startPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

        await new dbWalletManeger(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[0]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[1]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[2]).deposit(50);
        await new dbWalletManeger(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[3]).deposit(50);

      })
      after(async () => {
        await deleteDatabse(ID_FOR_DISTRIBUITION);
        await deleteDatabse(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

      })

      it('Add Bet', async function () {

        let pollController = new PollController(ID_FOR_DISTRIBUITION);

        const BetAmontForTest_I = 2;
        const BetAmontForTest_III = 2000;


        let addBetResult_I = await pollController.AddBet(
          USERS_IDS_FOR_TESTS[0],
          1,
          BetAmontForTest_I);

        await pollController.AddBet(
          USERS_IDS_FOR_TESTS[1],
          0,
          BetAmontForTest_I);

        await pollController.AddBet(
          USERS_IDS_FOR_TESTS[2],
          0,
          BetAmontForTest_I);

        let Poll = await pollController.getCurrentPoll();

        expect(Poll.Bets).to.deep.equal([
          new PollBeat(0).setNumberOfBets(2),
          new PollBeat(1).setNumberOfBets(1)]);
        expect(addBetResult_I).to.deep.equal({ BetAcepted: { Bet: BetAmontForTest_I } });
        //Tests if the answer or a bottomless bet returns an error

        await pollController.AddBet(
          USERS_IDS_FOR_TESTS[3],
          1,
          BetAmontForTest_III)
          .catch((addBetResult_III) => {
            expect(addBetResult_III.RequestError).to.exist.and.have.key('InsufficientFunds')
            return resolve();
          })
      })

      async function waitResult(pollController: PollController, onCompleted: { (): Promise<void>; (): Promise<void>; (): any; }) {
        let Poll: any = await pollController.getCurrentPoll();
        if (Poll.PollStatus.DistributionCompleted) {
          await onCompleted()
        } else waitResult(pollController, onCompleted);

        await sleep(50);
      }

      it('Distribution', async function () {

        let pollController = new PollController(ID_FOR_DISTRIBUITION);

        await pollController.AddBet(USERS_IDS_FOR_TESTS[0], 0, 25);
        await pollController.AddBet(USERS_IDS_FOR_TESTS[1], 1, 25);

        let ButtonsToTestWithWinners = [
          new PollButton(0, 'wait', '#FFFFFF', false),
          new PollButton(1, 'black', '#000000', true)
        ];

        let wallet_I: dbWallet = await getWallet(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[0]);
        let wallet_II: dbWallet = await getWallet(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[1]);
        expect(wallet_I.Coins).to.deep.equal(50);
        expect(wallet_II.Coins).to.deep.equal(50);

        expect(await pollController.StartDistribuition(
          ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

        await waitResult(pollController, async () => {
          let wallet_I: dbWallet = await getWallet(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[0]);
          let wallet_II: dbWallet = await getWallet(ID_FOR_DISTRIBUITION, USERS_IDS_FOR_TESTS[1]);

          expect(wallet_I.Coins).to.deep.equal(25);
          expect(wallet_II.Coins).to.deep.equal(77);

        });

      })

      it('Distribution for multiple results', async function () {
        this.timeout(4000);

        let pollController = new PollController(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

        await pollController.AddBet(USERS_IDS_FOR_TESTS[0], 1, 25);
        await pollController.AddBet(USERS_IDS_FOR_TESTS[1], 1, 25);
        await pollController.AddBet(USERS_IDS_FOR_TESTS[2], 2, 50);
        await pollController.AddBet(USERS_IDS_FOR_TESTS[3], 3, 30);

        let wallet = [];
        for (let i = 0; i < 4; i++) {
          wallet[i] = await getWallet(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[i]);
        }

        expect(wallet[0].Coins).to.deep.equal(50);
        expect(wallet[1].Coins).to.deep.equal(50);
        expect(wallet[2].Coins).to.deep.equal(50);
        expect(wallet[3].Coins).to.deep.equal(50);

        let ButtonsToTestWithWinners = [
          new PollButton(0, 'wait', '#FFFFFF', false),
          new PollButton(1, 'black', '#000000', false),
          new PollButton(2, 'yelow', '#000000', true),
          new PollButton(3, 'blue', '#000000', true)
        ];
        expect(await pollController.StartDistribuition(
          ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

        await waitResult(pollController, async () => {

          let wallet = [];
          for (let i = 0; i < 4; i++) {
            wallet[i] = await getWallet(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[i]);
          }
          expect(wallet[0].Coins).to.deep.equal(25);
          expect(wallet[1].Coins).to.deep.equal(25);
          expect(wallet[2].Coins).to.deep.equal(81.25);
          expect(wallet[3].Coins).to.deep.equal(68.75);

        });
      })
    })
  })

  describe('Mining', function () {

    before(async () => {
      await createDatabase(db_FOR_MINIG);
    })
    after(async () => {
      await deleteDatabse(db_FOR_MINIG)
    })

    it('Get Miner Settings', async function () {      
      expect(await StreamerSettings.getMinerSettings(db_FOR_MINIG))
        .to.deep.equal(new MinerSettings(100));// defauth value in db
    })

    it('Mining Maneger', async function () {
      let minerSettings = new MinerSettings(HOURLY_REWARD_FOR_TEST);

      let UpdateMinerResult = await StreamerSettings.UpdateMinerSettings(db_FOR_MINIG, minerSettings);

      expect(UpdateMinerResult).to.deep.include({ SuccessfullyUpdatedMinerSettings: minerSettings })

      let MinerSettingsResult = await StreamerSettings.getMinerSettings(db_FOR_MINIG);
      expect(MinerSettingsResult).to.deep.equal(minerSettings);

    })

    it('Mining Coins', async function () {
      this.slow(1500);
      let result1 = await MinerManeger.MineCoin(db_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
      expect(result1).to.include({ CoinsOfUser: REWARD_FOR_TEST_ATTEMPT })

      await sleep(MINIMUN_TIME_FOR_MINING);

      let result2 = await MinerManeger.MineCoin(db_FOR_MINIG, USERS_IDS_FOR_TESTS[0]);
      expect(result2).to.include({ CoinsOfUser: REWARD_FOR_TEST_ATTEMPT * 2 })

    })

  })

});
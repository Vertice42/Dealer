import { expect } from "chai";
import { resolve } from "bluebird";
import { PollStatus } from "../services/models/poll/PollStatus";
import { PollButton } from "../services/models/poll/PollButton";
import { Poll } from "../services/models/poll/Poll";
import { MinerManeger } from "../services/modules/database/miner/dbMinerManager";
import { MinerSettings, MinimunTimeForMining } from "../services/models/miner/MinerSettings";
import { getWallet, WalletManeger } from "../services/modules/database/miner/dbWalletManager";
import { dbWallet } from "../services/models/poll/dbWallet";
import { PollController } from "../services/controller/PollController";
import { PollBeat } from "../services/models/poll/PollBeat";
import { dbStreamerManager } from "../services/modules/database/dbStreamerManager";
import { Loading } from "../services/modules/database/dbLoading";

const UsersIdsForTests = ['jukes', 'lato', 'naruto', 'saske', 'bankai'];

const IDForManagerPoll = 'amaterasu';
const DatabaseForUpdateButtons = 'lapis';
const IDForDistribuition = 'perola';
const IDForDistributionOfmultipleResults = 'quark';
const IDForCreate = 'jasper';
const DatabaseForMinig = 'peridote';
const DatabasePreCreated = 'dava';

const HourlyRewardForTest = 102;
const RewardForTestAttempt = new MinerSettings(HourlyRewardForTest).RewardPerMining;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createDatabase(StreamersID: string) {
  let CreateResult = await dbStreamerManager.CreateStreamerDataBase(StreamersID);
  await Loading.StreamerDatabase(StreamersID);
  return CreateResult;
}

async function deleteDatabse(StreamersID: string) {
  return dbStreamerManager.DeleteStreamerDataBase(StreamersID);
}

async function createPoll(StreamersID: string) {
  return new PollController(StreamersID).CreatePoll()
}

async function startPoll(StreamersID: string) {
  let AccountData = dbStreamerManager.getAccountData(StreamersID);
  AccountData.CurrentPollStatus.PollStarted = true;
  return new PollController(StreamersID).UpdatePoll([
    new PollButton(0, 'wait', '#FFFFFF', false),
    new PollButton(1, 'black', '#000000', false)])
}

describe('DATABASE_MANAGER', () => {
  after(async () => { await deleteDatabse(IDForCreate) })

  it('CreateStreamerDataBase', async function () {
    expect(await createDatabase(IDForCreate)).to.include.keys('StreamerDataBaseCreated');
  });

  describe('Poll', () => {
    before(async function () {
      await createDatabase(IDForManagerPoll);
    });
    after(async function () {
      await deleteDatabse(IDForManagerPoll);
    })

    it('Load poll already created in db already created', async function () {
      let Poll = await new PollController(DatabasePreCreated).getCurrentPoll()
      expect(Poll.PollStatus).to.deep.equal(new PollStatus().start().stop());
      expect(Poll.PollButtons).to.deep.equal([
        new PollButton(0, '', '#ed8e3b', true),
        new PollButton(1, '', '#efc289', false)]);
      expect(Poll.Bets).to.deep.equal([]);

    })

    it('First Get Poll', async function () {
      expect((await new PollController(IDForManagerPoll).getCurrentPoll()).PollStatus)
        .to.deep.equal(new PollStatus().waxe());
    })

    it('CreatePoll', async function () {
      expect(await new PollController(IDForManagerPoll).CreatePoll()).to.include.keys('PollCreated');
    })

    var ButtonsToTest = [];
    it('Start Poll', async function () {
      let AccountData = dbStreamerManager.getAccountData(IDForManagerPoll);
      AccountData.CurrentPollStatus.start();

      ButtonsToTest.push(new PollButton(0, 'waite', '#FFFFFF', false))
      ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))

      let UpdatePollResult = await new PollController(IDForManagerPoll).UpdatePoll(ButtonsToTest)

      expect(UpdatePollResult.UpdatePollStatusRes).to.include({ PollStarted: true });
      expect(UpdatePollResult.UpdateButtonGroupRes).to.include(
        { CreatedButtons: 2, UpdatedButtons: 0, DeletedButtons: 0 });
    })

    it('Get Poll', async function () {
      let poll: Poll = await new PollController(IDForManagerPoll).getCurrentPoll();

      let PollForTest = new PollStatus();
      PollForTest.PollStarted = true;

      expect(poll.PollStatus).to.deep.equal(PollForTest);
      expect(poll.PollButtons).to.deep.equal(ButtonsToTest);

    })

    describe('Update Buttons', function () {
      this.timeout(4000);

      before(async function () {
        await createDatabase(DatabaseForUpdateButtons);
        await createPoll(DatabaseForUpdateButtons);
        await startPoll(DatabaseForUpdateButtons);
      })
      after(async () => {
        await deleteDatabse(DatabaseForUpdateButtons);
      })

      it('Modify buttons', async function () {
        this.slow(300);
        await sleep(500);

        let ButtonsToTest = [];
        //ButtonsToTest.push(new PollButton(0,'waite','#FFFFFF',false))   // DELETE
        ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))
        ButtonsToTest.push(new PollButton(2, 'black', '#000020', false))
        ButtonsToTest.push(new PollButton(3, 'wait', '#FFFFFF', false))  // NEW

        let pollController = new PollController(DatabaseForUpdateButtons);


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
      dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.stop();

      expect((await new PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollStarted: true, PollStoped: true });

    });

    it('Restart Poll', async function () {
      dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.restart();

      expect((await new PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollStarted: true, PollStoped: false });
    });

    it('Waxe Poll', async function () {
      dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.waxe();

      expect((await new PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
        .to.include({ PollWaxed: true });
    })

    describe('Distribution', function () {
      this.timeout(6000);

      before(async () => {
        await createDatabase(IDForDistribuition);
        await createPoll(IDForDistribuition);
        await startPoll(IDForDistribuition);

        await new WalletManeger(IDForDistribuition, UsersIdsForTests[0]).deposit(50);
        await new WalletManeger(IDForDistribuition, UsersIdsForTests[1]).deposit(50);
        await new WalletManeger(IDForDistribuition, UsersIdsForTests[2]).deposit(50);
        await new WalletManeger(IDForDistribuition, UsersIdsForTests[3]).deposit(50);

        ///////////////////////////////////////////////////////////////////////////////

        await createDatabase(IDForDistributionOfmultipleResults);
        await createPoll(IDForDistributionOfmultipleResults);
        await startPoll(IDForDistributionOfmultipleResults);

        await new WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[0]).deposit(50);
        await new WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[1]).deposit(50);
        await new WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[2]).deposit(50);
        await new WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[3]).deposit(50);

      })
      after(async () => {
        await deleteDatabse(IDForDistribuition);
        await deleteDatabse(IDForDistributionOfmultipleResults);

      })

      it('Add Bet', async function () {

        let pollController = new PollController(IDForDistribuition);

        const BetAmontForTest_I = 2;
        const BetAmontForTest_III = 2000;


        let addBetResult_I = await pollController.AddBet(
          UsersIdsForTests[0],
          1,
          BetAmontForTest_I);

        await pollController.AddBet(
          UsersIdsForTests[1],
          0,
          BetAmontForTest_I);

        await pollController.AddBet(
          UsersIdsForTests[2],
          0,
          BetAmontForTest_I);

        let Poll = await pollController.getCurrentPoll();

        expect(Poll.Bets).to.deep.equal([
          new PollBeat(0).setNumberOfBets(2),
          new PollBeat(1).setNumberOfBets(1)]);
        expect(addBetResult_I).to.deep.equal({ BetAcepted: { Bet: BetAmontForTest_I } });
        //Tests if the answer or a bottomless bet returns an error

        await pollController.AddBet(
          UsersIdsForTests[3],
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

        let pollController = new PollController(IDForDistribuition);

        await pollController.AddBet(UsersIdsForTests[0], 0, 25);
        await pollController.AddBet(UsersIdsForTests[1], 1, 25);

        let ButtonsToTestWithWinners = [
          new PollButton(0, 'wait', '#FFFFFF', false),
          new PollButton(1, 'black', '#000000', true)
        ];

        let wallet_I: dbWallet = await getWallet(IDForDistribuition, UsersIdsForTests[0]);
        let wallet_II: dbWallet = await getWallet(IDForDistribuition, UsersIdsForTests[1]);
        expect(wallet_I.Coins).to.deep.equal(50);
        expect(wallet_II.Coins).to.deep.equal(50);

        expect(await pollController.StartDistribuition(
          ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

        await waitResult(pollController, async () => {
          let wallet_I: dbWallet = await getWallet(IDForDistribuition, UsersIdsForTests[0]);
          let wallet_II: dbWallet = await getWallet(IDForDistribuition, UsersIdsForTests[1]);

          expect(wallet_I.Coins).to.deep.equal(25);
          expect(wallet_II.Coins).to.deep.equal(77);

        });

      })

      it('Distribution for multiple results', async function () {
        this.timeout(4000);

        let pollController = new PollController(IDForDistributionOfmultipleResults);

        await pollController.AddBet(UsersIdsForTests[0], 1, 25);
        await pollController.AddBet(UsersIdsForTests[1], 1, 25);
        await pollController.AddBet(UsersIdsForTests[2], 2, 50);
        await pollController.AddBet(UsersIdsForTests[3], 3, 30);

        let wallet = [];
        for (let i = 0; i < 4; i++) {
          wallet[i] = await getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
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
            wallet[i] = await getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
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
      await createDatabase(DatabaseForMinig);
    })
    after(async () => {
      await deleteDatabse(DatabaseForMinig)
    })

    it('Get Miner Settings', async function () {
      expect(await MinerManeger.getMinerSettings(DatabaseForMinig))
        .to.deep.equal(new MinerSettings(100));// defauth value in db
    })

    it('Mining Maneger', async function () {
      let minerSettings = new MinerSettings(HourlyRewardForTest);

      let UpdateMinerResult = await MinerManeger.UpdateSettings(DatabaseForMinig, minerSettings);

      expect(UpdateMinerResult).to.deep.include({ SuccessfullyUpdatedMinerSettings: minerSettings })

      let MinerSettingsResult = await MinerManeger.getMinerSettings(DatabaseForMinig);
      expect(MinerSettingsResult).to.deep.equal(minerSettings);

    })

    it('Mining Coins', async function () {
      this.slow(1500);
      let result1 = await MinerManeger.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
      expect(result1).to.include({ CoinsOfUser: RewardForTestAttempt })

      await sleep(MinimunTimeForMining);

      let result2 = await MinerManeger.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
      expect(result2).to.include({ CoinsOfUser: RewardForTestAttempt * 2 })

    })

  })

});
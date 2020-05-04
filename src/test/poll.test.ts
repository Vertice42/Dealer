import { expect } from "chai";

import { PollStatus } from "../services/models/poll/PollStatus";

import { PollButton } from "../services/models/poll/PollButton";

import { Poll } from "../services/models/poll/Poll";

import { dbWallet } from "../services/models/poll/dbWallet";
import { resolve } from "bluebird";
import { createStreamerTables, ID_FOR_MANAGER_POLL, deleteStreamerTables, db_FOR_UPDATE_BUTTONS, createPoll, startPoll, ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS, ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS } from "./ForTests.test";
import { sleep } from "../services/utils/functions";
import { PollBet } from "../services/models/poll/PollBeat";
import PollController from "../services/controller/PollController";
import { dbWalletManager, getWallet } from "../services/modules/databaseManager/wallet/dbWalletManager";

describe('Poll', () => {
  before(async function () {
    await createStreamerTables(ID_FOR_MANAGER_POLL);
  });
  after(async function () {
    await deleteStreamerTables(ID_FOR_MANAGER_POLL);
  })

  it('First Get Poll', async function () {
    expect((await new PollController(ID_FOR_MANAGER_POLL).getCurrentPollStatus()))
      .to.deep.equal(new PollStatus().wax());
  })

  it('CreatePoll', async function () {
    expect(await new PollController(ID_FOR_MANAGER_POLL).CreatePoll(new PollStatus())).to.include.keys('PollCreated');
  })

  var ButtonsToTest = [];
  it('Start Poll', async function () {
    ButtonsToTest.push(new PollButton(0, 'waite', '#FFFFFF', false))
    ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))

    let pollC = new PollController(ID_FOR_MANAGER_POLL);

    let UpdatePollResult = await pollC.UpdatePoll((await pollC.getCurrentPollStatus()).start(), ButtonsToTest)

    expect(UpdatePollResult[0].PollStarted).to.deep.equal(true);
    expect(UpdatePollResult[1]).to.deep.include(
      { CreatedButtons: 2, UpdatedButtons: 0, DeletedButtons: 0 });
  })

  it('Get Poll', async function () {
    let poll = await new PollController(ID_FOR_MANAGER_POLL).getCurrentPoll();

    let PollStatusExpected = new PollStatus().start();
    PollStatusExpected.id = 1;
    PollStatusExpected.updated_at = poll.PollStatus.updated_at;
    PollStatusExpected.StatisticsOfDistributionJson = undefined;

    expect(poll.PollStatus).to.deep.equal(PollStatusExpected);
    expect(poll.PollButtons).to.deep.equal(ButtonsToTest);

  })

  describe('Update Buttons', function () {
    this.timeout(4000);

    before(async function () {
      await createStreamerTables(db_FOR_UPDATE_BUTTONS);
      await createPoll(db_FOR_UPDATE_BUTTONS);
      await startPoll(db_FOR_UPDATE_BUTTONS);
    })
    after(async () => {
      await deleteStreamerTables(db_FOR_UPDATE_BUTTONS);
    })

    it('Modify buttons', async function () {
      this.slow(600);
      await sleep(500);

      let ButtonsToTest = [];
      //ButtonsToTest.push(new PollButton(0,'waite','#FFFFFF',false))   // DELETE
      ButtonsToTest.push(new PollButton(1, 'black', '#000000', false))
      ButtonsToTest.push(new PollButton(2, 'black', '#000020', false))
      ButtonsToTest.push(new PollButton(3, 'wait', '#FFFFFF', false))  // NEW

      let pollController = new PollController(db_FOR_UPDATE_BUTTONS);

      expect((await pollController.UpdateButtonsOfPoll(ButtonsToTest))).to.include(
        { CreatedButtons: 2, UpdatedButtons: 1, DeletedButtons: 1 });

      let poll = await pollController.getCurrentPoll();

      let PollStatusForTest = new PollStatus().start();
      PollStatusForTest.id = 1;
      PollStatusForTest.StatisticsOfDistributionJson = undefined;
      PollStatusForTest.updated_at = poll.PollStatus.updated_at;

      let pollForCompare = new Poll(
        PollStatusForTest,
        ButtonsToTest,
        new Date().getTime(),
        []);

      expect(poll.PollStatus).to.deep.equal(pollForCompare.PollStatus);
      expect(poll.PollButtons).to.deep.equal(pollForCompare.PollButtons);
      expect(poll.Bets).to.deep.equal(pollForCompare.Bets);
    })

  })

  it('Stop Poll', async function () {
    let pollController = new PollController(ID_FOR_MANAGER_POLL);

    expect((await pollController.UpdatePollStatus((await pollController.getCurrentPollStatus()).stop()))).to.include({ PollStarted: true, PollStopped: true });

  });

  it('Restart Poll', async function () {
    let PollC = new PollController(ID_FOR_MANAGER_POLL);

    expect(await (PollC.UpdatePollStatus((await PollC.getCurrentPollStatus()).restart())))
      .to.include({ PollStarted: true, PollStopped: false });
  });

  it('Wax Poll', async function () {
    let PollC = new PollController(ID_FOR_MANAGER_POLL);
    expect(await (PollC.UpdatePollStatus((await PollC.getCurrentPollStatus()).wax())))
      .to.include({ PollWaxed: true });
  })

  describe('Distribution', function () {
    this.timeout(7000);

    before(async () => {
      await createStreamerTables(ID_FOR_DISTRIBUTION);
      await createPoll(ID_FOR_DISTRIBUTION);
      await startPoll(ID_FOR_DISTRIBUTION);

      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[2]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[3]).deposit(50);

      ///////////////////////////////////////////////////////////////////////////////

      await createStreamerTables(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
      await createPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
      await startPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[0]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[1]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[2]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[3]).deposit(50);

    })

    it('Add Bet', async function () {
      let pollController = new PollController(ID_FOR_DISTRIBUTION);

      const BetAmountForTest_I = 2;
      const BetAmountForTest_III = 2000;

      let addBetResult_I = await pollController.AddBet(
        USERS_IDS_FOR_TESTS[0],
        1,
        BetAmountForTest_I);

      await pollController.AddBet(
        USERS_IDS_FOR_TESTS[1],
        0,
        BetAmountForTest_I);

      await pollController.AddBet(
        USERS_IDS_FOR_TESTS[2],
        0,
        BetAmountForTest_I);
      await pollController.AddBet(
        USERS_IDS_FOR_TESTS[3],
        1,
        BetAmountForTest_III)
        .catch((addBetResult_III) => {
          expect(addBetResult_III.RequestError).to.exist.and.have.key('InsufficientFunds')
          return resolve();
        })

      expect(addBetResult_I).to.deep.equal({ BetAccepted: { Bet: BetAmountForTest_I } });

      let Poll = await pollController.getCurrentPoll();
      expect(Poll.Bets).to.deep.equal([
        new PollBet(0, 2),
        new PollBet(1, 1)])
    })

    async function waitDistributionCompleted(pollController: PollController) {
      let CurrentPollStatus = await pollController.getCurrentPollStatus();

      if (!CurrentPollStatus.DistributionCompleted) {
        await sleep(50);
        await waitDistributionCompleted(pollController);
      }
      return resolve();
    }

    it('Distribution', async function () {
      this.timeout(30000);

      let pollC = new PollController(ID_FOR_DISTRIBUTION);

      await pollC.AddBet(USERS_IDS_FOR_TESTS[0], 0, 10);
      await pollC.AddBet(USERS_IDS_FOR_TESTS[1], 1, 5);

      let ButtonsToTestWithWinners = [
        new PollButton(0, 'wait', '#FFFFFF', false),
        new PollButton(1, 'black', '#000000', true)
      ];

      let wallet_I: dbWallet = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]);
      let wallet_II: dbWallet = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]);

      expect(wallet_I.Coins).to.deep.equal(40);
      expect(wallet_II.Coins).to.deep.equal(45);

      pollC.OnDistributionsEnd = async () => {
        pollC.UpdatePollStatus((await pollC.getCurrentPollStatus()).setDistributionAsCompleted());
      }

      expect(await pollC.startDistributions(
        ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

      await waitDistributionCompleted(pollC);

      wallet_I = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]);
      wallet_II = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]);

      expect(wallet_I.Coins).to.equal(40);
      expect(wallet_II.Coins).to.equal(62);

    })

    it('Distribution for multiple results', async function () {
      this.timeout(30000);

      let pollC = new PollController(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

      await pollC.AddBet(USERS_IDS_FOR_TESTS[0], 1, 10);
      await pollC.AddBet(USERS_IDS_FOR_TESTS[1], 1, 15);
      await pollC.AddBet(USERS_IDS_FOR_TESTS[2], 2, 20);
      await pollC.AddBet(USERS_IDS_FOR_TESTS[3], 3, 30);

      let wallets = [];
      for (let i = 0; i < 4; i++) {
        wallets[i] = await getWallet(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[i]);
      }

      expect(wallets[0].Coins).to.deep.equal(40);
      expect(wallets[1].Coins).to.deep.equal(35);
      expect(wallets[2].Coins).to.deep.equal(30);
      expect(wallets[3].Coins).to.deep.equal(20);

      let ButtonsToTestWithWinners = [
        new PollButton(0, 'wait', '#FFFFFF', false),
        new PollButton(1, 'black', '#000000', false),
        new PollButton(2, 'yellow', '#000000', true),
        new PollButton(3, 'blue', '#000000', true)
      ];

      pollC.OnDistributionsEnd = async () => {
        pollC.UpdatePollStatus((await pollC.getCurrentPollStatus()).setDistributionAsCompleted());
      }

      expect(await pollC.startDistributions(
        ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

      await waitDistributionCompleted(pollC);

      wallets = [];
      for (let i = 0; i < 4; i++) {
        wallets[i] = await getWallet(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[i]);
      }
      expect(wallets[0].Coins).to.deep.equal(40);
      expect(wallets[1].Coins).to.deep.equal(35);
      expect(wallets[2].Coins).to.deep.equal(60);
      expect(wallets[3].Coins).to.deep.equal(65);

    })

    after(async () => {
      await deleteStreamerTables(ID_FOR_DISTRIBUTION);
      await deleteStreamerTables(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
    })
  })
})
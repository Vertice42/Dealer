import { expect } from "chai";

import { PollStatus } from "../services/models/poll/PollStatus";

import { PollButton } from "../services/models/poll/PollButton";

import { dbManager } from "../services/modules/database/dbManager";

import { Poll } from "../services/models/poll/Poll";


import { PollBeat } from "../services/models/poll/PollBeat";

import { dbWallet } from "../services/models/poll/dbWallet";
import { PollController } from "../services/controller/PollController";
import { resolve } from "bluebird";
import { createAndStartStreamerDatabase, ID_FOR_MANAGER_POLL, deleteStreamerDatabase, db_PRE_CREATED, db_FOR_UPDATE_BUTTONS, createPoll, startPoll, ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS, ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS } from "./ForTests.test";
import { dbWalletManager, getWallet } from "../services/modules/database/wallet/dbWalletManager";
import { sleep } from "../utils/functions";

describe('Poll', () => {
  before(async function () {
    await createAndStartStreamerDatabase(db_PRE_CREATED);
    await createAndStartStreamerDatabase(ID_FOR_MANAGER_POLL);
  });
  after(async function () {
    await deleteStreamerDatabase(ID_FOR_MANAGER_POLL);
  })

  it('Load poll already created in db already created', async function () {
    let Poll = await new PollController(db_PRE_CREATED).getCurrentPoll();
    expect(Poll.PollStatus).to.deep.equal(new PollStatus().start());
    expect(Poll.PollButtons).to.deep.equal([
      new PollButton(0, '', '#2cd571', false),
      new PollButton(1, '', '#8a65c3', false)]);
    expect(Poll.Bets).to.deep.equal([{
      BetID: 0,
      NumberOfBets: 1
    }]);

  })

  it('First Get Poll', async function () {
    expect((await new PollController(ID_FOR_MANAGER_POLL).getCurrentPoll()).PollStatus)
      .to.deep.equal(new PollStatus().wax());
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
      await createAndStartStreamerDatabase(db_FOR_UPDATE_BUTTONS);
      await createPoll(db_FOR_UPDATE_BUTTONS);
      await startPoll(db_FOR_UPDATE_BUTTONS);
    })
    after(async () => {
      await deleteStreamerDatabase(db_FOR_UPDATE_BUTTONS);
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

      let pollForCompare = new Poll(
        new PollStatus().start(),
        ButtonsToTest,
        new Date().getTime(),
        undefined, []);

      expect(poll.PollStatus).to.deep.equal(pollForCompare.PollStatus);
      expect(poll.PollButtons).to.deep.equal(pollForCompare.PollButtons);
      expect(poll.Bets).to.deep.equal(pollForCompare.Bets);
    })

  })

  it('Stop Poll', async function () {
    dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.stop();

    expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
      .to.include({ PollStarted: true, PollStopped: true });

  });

  it('Restart Poll', async function () {
    dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.restart();

    expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
      .to.include({ PollStarted: true, PollStopped: false });
  });

  it('Wax Poll', async function () {
    dbManager.getAccountData(ID_FOR_MANAGER_POLL).CurrentPollStatus.wax();

    expect((await new PollController(ID_FOR_MANAGER_POLL).UpdatePoll(undefined)).UpdatePollStatusRes)
      .to.include({ PollWaxed: true });
  })

  describe('Distribution', function () {
    this.timeout(7000);

    before(async () => {
      await createAndStartStreamerDatabase(ID_FOR_DISTRIBUTION);
      await createPoll(ID_FOR_DISTRIBUTION);
      await startPoll(ID_FOR_DISTRIBUTION);

      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[2]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[3]).deposit(50);

      ///////////////////////////////////////////////////////////////////////////////

      await createAndStartStreamerDatabase(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
      await createPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);
      await startPoll(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[0]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[1]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[2]).deposit(50);
      await new dbWalletManager(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[3]).deposit(50);

    })
    after(async () => {
      await deleteStreamerDatabase(ID_FOR_DISTRIBUTION);
      await deleteStreamerDatabase(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

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

      let Poll = await pollController.getCurrentPoll();

      expect(Poll.Bets).to.deep.equal([
        new PollBeat(0).setNumberOfBets(2),
        new PollBeat(1).setNumberOfBets(1)]);
      expect(addBetResult_I).to.deep.equal({ BetAccepted: { Bet: BetAmountForTest_I } });
      //Tests if the answer or a bottomless bet returns an error

      await pollController.AddBet(
        USERS_IDS_FOR_TESTS[3],
        1,
        BetAmountForTest_III)
        .catch((addBetResult_III) => {
          expect(addBetResult_III.RequestError).to.exist.and.have.key('InsufficientFunds')
          return resolve();
        })
    })

    async function waitDistributionCompleted(pollController: PollController) {
      let Poll: any = await pollController.getCurrentPoll();
      if (Poll.PollStatus.DistributionCompleted) {
        return resolve();
      } else waitDistributionCompleted(pollController);

      await sleep(50);
    }

    it('Distribution', async function () {

      let pollController = new PollController(ID_FOR_DISTRIBUTION);

      await pollController.AddBet(USERS_IDS_FOR_TESTS[0], 0, 10);
      await pollController.AddBet(USERS_IDS_FOR_TESTS[1], 1, 5);

      let ButtonsToTestWithWinners = [
        new PollButton(0, 'wait', '#FFFFFF', false),
        new PollButton(1, 'black', '#000000', true)
      ];

      let wallet_I: dbWallet = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]);
      let wallet_II: dbWallet = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]);

      expect(wallet_I.Coins).to.deep.equal(40);
      expect(wallet_II.Coins).to.deep.equal(45);

      expect(await pollController.startDistributions(
        ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

      await waitDistributionCompleted(pollController);

      wallet_I = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[0]);
      wallet_II = await getWallet(ID_FOR_DISTRIBUTION, USERS_IDS_FOR_TESTS[1]);

      expect(wallet_I.Coins).to.equal(40);
      expect(wallet_II.Coins).to.equal(57);

    })

    it('Distribution for multiple results', async function () {
      this.timeout(4000);

      let pollController = new PollController(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS);

      await pollController.AddBet(USERS_IDS_FOR_TESTS[0], 1, 10);
      await pollController.AddBet(USERS_IDS_FOR_TESTS[1], 1, 15);
      await pollController.AddBet(USERS_IDS_FOR_TESTS[2], 2, 20);
      await pollController.AddBet(USERS_IDS_FOR_TESTS[3], 3, 30);

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
      expect(await pollController.startDistributions(
        ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');

      await waitDistributionCompleted(pollController);      

      wallets = [];
      for (let i = 0; i < 4; i++) {
        wallets[i] = await getWallet(ID_FOR_DISTRIBUTION_OF_MULTIPLE_RESULTS, USERS_IDS_FOR_TESTS[i]);
      }
      expect(wallets[0].Coins).to.deep.equal(40);
      expect(wallets[1].Coins).to.deep.equal(35);
      expect(wallets[2].Coins).to.deep.equal(40);
      expect(wallets[3].Coins).to.deep.equal(35);

    })
  })
})
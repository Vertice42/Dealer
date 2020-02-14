"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const bluebird_1 = require("bluebird");
const PollStatus_1 = require("../services/models/poll/PollStatus");
const PollButton_1 = require("../services/models/poll/PollButton");
const Poll_1 = require("../services/models/poll/Poll");
const MinerSettings_1 = require("../services/models/miner/MinerSettings");
const dbWalletManager_1 = require("../services/modules/database/miner/dbWalletManager");
const PollController_1 = require("../services/controller/PollController");
const PollBeat_1 = require("../services/models/poll/PollBeat");
const dbStreamerManager_1 = require("../services/modules/database/dbStreamerManager");
const dbLoading_1 = require("../services/modules/database/dbLoading");
const StreamerSettings_1 = require("../services/modules/database/streamer_settings/StreamerSettings");
const dbMinerManager_1 = require("../services/modules/database/miner/dbMinerManager");
const UsersIdsForTests = ['jukes', 'lato', 'naruto', 'saske', 'bankai'];
const IDForManagerPoll = 'amaterasu';
const DatabaseForUpdateButtons = 'lapis';
const IDForDistribuition = 'perola';
const IDForDistributionOfmultipleResults = 'quark';
const IDForCreate = 'jasper';
const DatabaseForMinig = 'peridote';
const DatabasePreCreated = 'dava';
const HourlyRewardForTest = 102;
const RewardForTestAttempt = new MinerSettings_1.MinerSettings(HourlyRewardForTest).RewardPerMining;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function createDatabase(StreamersID) {
    let CreateResult = await dbStreamerManager_1.dbStreamerManager.CreateStreamerDataBase(StreamersID);
    await dbLoading_1.Loading.StreamerDatabase(StreamersID);
    return CreateResult;
}
async function deleteDatabse(StreamersID) {
    return dbStreamerManager_1.dbStreamerManager.DeleteStreamerDataBase(StreamersID);
}
async function createPoll(StreamersID) {
    return new PollController_1.PollController(StreamersID).CreatePoll();
}
async function startPoll(StreamersID) {
    let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamersID);
    AccountData.CurrentPollStatus.PollStarted = true;
    return new PollController_1.PollController(StreamersID).UpdatePoll([
        new PollButton_1.PollButton(0, 'wait', '#FFFFFF', false),
        new PollButton_1.PollButton(1, 'black', '#000000', false)
    ]);
}
describe('DATABASE_MANAGER', () => {
    after(async () => { await deleteDatabse(IDForCreate); });
    it('CreateStreamerDataBase', async function () {
        chai_1.expect(await createDatabase(IDForCreate)).to.include.keys('StreamerDataBaseCreated');
    });
    describe('Poll', () => {
        before(async function () {
            await createDatabase(IDForManagerPoll);
        });
        after(async function () {
            await deleteDatabse(IDForManagerPoll);
        });
        it('Load poll already created in db already created', async function () {
            let Poll = await new PollController_1.PollController(DatabasePreCreated).getCurrentPoll();
            chai_1.expect(Poll.PollStatus).to.deep.equal(new PollStatus_1.PollStatus().start().stop());
            chai_1.expect(Poll.PollButtons).to.deep.equal([
                new PollButton_1.PollButton(0, '', '#ed8e3b', true),
                new PollButton_1.PollButton(1, '', '#efc289', false)
            ]);
            chai_1.expect(Poll.Bets).to.deep.equal([]);
        });
        it('First Get Poll', async function () {
            chai_1.expect((await new PollController_1.PollController(IDForManagerPoll).getCurrentPoll()).PollStatus)
                .to.deep.equal(new PollStatus_1.PollStatus().waxe());
        });
        it('CreatePoll', async function () {
            chai_1.expect(await new PollController_1.PollController(IDForManagerPoll).CreatePoll()).to.include.keys('PollCreated');
        });
        var ButtonsToTest = [];
        it('Start Poll', async function () {
            let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll);
            AccountData.CurrentPollStatus.start();
            ButtonsToTest.push(new PollButton_1.PollButton(0, 'waite', '#FFFFFF', false));
            ButtonsToTest.push(new PollButton_1.PollButton(1, 'black', '#000000', false));
            let UpdatePollResult = await new PollController_1.PollController(IDForManagerPoll).UpdatePoll(ButtonsToTest);
            chai_1.expect(UpdatePollResult.UpdatePollStatusRes).to.include({ PollStarted: true });
            chai_1.expect(UpdatePollResult.UpdateButtonGroupRes).to.include({ CreatedButtons: 2, UpdatedButtons: 0, DeletedButtons: 0 });
        });
        it('Get Poll', async function () {
            let poll = await new PollController_1.PollController(IDForManagerPoll).getCurrentPoll();
            let PollForTest = new PollStatus_1.PollStatus();
            PollForTest.PollStarted = true;
            chai_1.expect(poll.PollStatus).to.deep.equal(PollForTest);
            chai_1.expect(poll.PollButtons).to.deep.equal(ButtonsToTest);
        });
        describe('Update Buttons', function () {
            this.timeout(4000);
            before(async function () {
                await createDatabase(DatabaseForUpdateButtons);
                await createPoll(DatabaseForUpdateButtons);
                await startPoll(DatabaseForUpdateButtons);
            });
            after(async () => {
                await deleteDatabse(DatabaseForUpdateButtons);
            });
            it('Modify buttons', async function () {
                this.slow(300);
                await sleep(500);
                let ButtonsToTest = [];
                //ButtonsToTest.push(new PollButton(0,'waite','#FFFFFF',false))   // DELETE
                ButtonsToTest.push(new PollButton_1.PollButton(1, 'black', '#000000', false));
                ButtonsToTest.push(new PollButton_1.PollButton(2, 'black', '#000020', false));
                ButtonsToTest.push(new PollButton_1.PollButton(3, 'wait', '#FFFFFF', false)); // NEW
                let pollController = new PollController_1.PollController(DatabaseForUpdateButtons);
                chai_1.expect((await pollController.UpdatePoll(ButtonsToTest)).UpdateButtonGroupRes).to.include({ CreatedButtons: 2, UpdatedButtons: 1, DeletedButtons: 1 });
                let poll = await pollController.getCurrentPoll();
                let pollForComper = new Poll_1.Poll(new PollStatus_1.PollStatus().start(), ButtonsToTest, new Date().getTime(), undefined, []);
                chai_1.expect(poll.PollStatus).to.deep.equal(pollForComper.PollStatus);
                chai_1.expect(poll.PollButtons).to.deep.equal(pollForComper.PollButtons);
                chai_1.expect(poll.Bets).to.deep.equal(pollForComper.Bets);
            });
        });
        it('Stop Poll', async function () {
            dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.stop();
            chai_1.expect((await new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                .to.include({ PollStarted: true, PollStoped: true });
        });
        it('Restart Poll', async function () {
            dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.restart();
            chai_1.expect((await new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                .to.include({ PollStarted: true, PollStoped: false });
        });
        it('Waxe Poll', async function () {
            dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.waxe();
            chai_1.expect((await new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                .to.include({ PollWaxed: true });
        });
        describe('Distribution', function () {
            this.timeout(6000);
            before(async () => {
                await createDatabase(IDForDistribuition);
                await createPoll(IDForDistribuition);
                await startPoll(IDForDistribuition);
                await new dbWalletManager_1.dbWalletManeger(IDForDistribuition, UsersIdsForTests[0]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistribuition, UsersIdsForTests[1]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistribuition, UsersIdsForTests[2]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistribuition, UsersIdsForTests[3]).deposit(50);
                ///////////////////////////////////////////////////////////////////////////////
                await createDatabase(IDForDistributionOfmultipleResults);
                await createPoll(IDForDistributionOfmultipleResults);
                await startPoll(IDForDistributionOfmultipleResults);
                await new dbWalletManager_1.dbWalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[0]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[1]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[2]).deposit(50);
                await new dbWalletManager_1.dbWalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[3]).deposit(50);
            });
            after(async () => {
                await deleteDatabse(IDForDistribuition);
                await deleteDatabse(IDForDistributionOfmultipleResults);
            });
            it('Add Bet', async function () {
                let pollController = new PollController_1.PollController(IDForDistribuition);
                const BetAmontForTest_I = 2;
                const BetAmontForTest_III = 2000;
                let addBetResult_I = await pollController.AddBet(UsersIdsForTests[0], 1, BetAmontForTest_I);
                await pollController.AddBet(UsersIdsForTests[1], 0, BetAmontForTest_I);
                await pollController.AddBet(UsersIdsForTests[2], 0, BetAmontForTest_I);
                let Poll = await pollController.getCurrentPoll();
                chai_1.expect(Poll.Bets).to.deep.equal([
                    new PollBeat_1.PollBeat(0).setNumberOfBets(2),
                    new PollBeat_1.PollBeat(1).setNumberOfBets(1)
                ]);
                chai_1.expect(addBetResult_I).to.deep.equal({ BetAcepted: { Bet: BetAmontForTest_I } });
                //Tests if the answer or a bottomless bet returns an error
                await pollController.AddBet(UsersIdsForTests[3], 1, BetAmontForTest_III)
                    .catch((addBetResult_III) => {
                    chai_1.expect(addBetResult_III.RequestError).to.exist.and.have.key('InsufficientFunds');
                    return bluebird_1.resolve();
                });
            });
            async function waitResult(pollController, onCompleted) {
                let Poll = await pollController.getCurrentPoll();
                if (Poll.PollStatus.DistributionCompleted) {
                    await onCompleted();
                }
                else
                    waitResult(pollController, onCompleted);
                await sleep(50);
            }
            it('Distribution', async function () {
                let pollController = new PollController_1.PollController(IDForDistribuition);
                await pollController.AddBet(UsersIdsForTests[0], 0, 25);
                await pollController.AddBet(UsersIdsForTests[1], 1, 25);
                let ButtonsToTestWithWinners = [
                    new PollButton_1.PollButton(0, 'wait', '#FFFFFF', false),
                    new PollButton_1.PollButton(1, 'black', '#000000', true)
                ];
                let wallet_I = await dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[0]);
                let wallet_II = await dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[1]);
                chai_1.expect(wallet_I.Coins).to.deep.equal(50);
                chai_1.expect(wallet_II.Coins).to.deep.equal(50);
                chai_1.expect(await pollController.StartDistribuition(ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');
                await waitResult(pollController, async () => {
                    let wallet_I = await dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[0]);
                    let wallet_II = await dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[1]);
                    chai_1.expect(wallet_I.Coins).to.deep.equal(25);
                    chai_1.expect(wallet_II.Coins).to.deep.equal(77);
                });
            });
            it('Distribution for multiple results', async function () {
                this.timeout(4000);
                let pollController = new PollController_1.PollController(IDForDistributionOfmultipleResults);
                await pollController.AddBet(UsersIdsForTests[0], 1, 25);
                await pollController.AddBet(UsersIdsForTests[1], 1, 25);
                await pollController.AddBet(UsersIdsForTests[2], 2, 50);
                await pollController.AddBet(UsersIdsForTests[3], 3, 30);
                let wallet = [];
                for (let i = 0; i < 4; i++) {
                    wallet[i] = await dbWalletManager_1.getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
                }
                chai_1.expect(wallet[0].Coins).to.deep.equal(50);
                chai_1.expect(wallet[1].Coins).to.deep.equal(50);
                chai_1.expect(wallet[2].Coins).to.deep.equal(50);
                chai_1.expect(wallet[3].Coins).to.deep.equal(50);
                let ButtonsToTestWithWinners = [
                    new PollButton_1.PollButton(0, 'wait', '#FFFFFF', false),
                    new PollButton_1.PollButton(1, 'black', '#000000', false),
                    new PollButton_1.PollButton(2, 'yelow', '#000000', true),
                    new PollButton_1.PollButton(3, 'blue', '#000000', true)
                ];
                chai_1.expect(await pollController.StartDistribuition(ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');
                await waitResult(pollController, async () => {
                    let wallet = [];
                    for (let i = 0; i < 4; i++) {
                        wallet[i] = await dbWalletManager_1.getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
                    }
                    chai_1.expect(wallet[0].Coins).to.deep.equal(25);
                    chai_1.expect(wallet[1].Coins).to.deep.equal(25);
                    chai_1.expect(wallet[2].Coins).to.deep.equal(81.25);
                    chai_1.expect(wallet[3].Coins).to.deep.equal(68.75);
                });
            });
        });
    });
    describe('Mining', function () {
        before(async () => {
            await createDatabase(DatabaseForMinig);
        });
        after(async () => {
            await deleteDatabse(DatabaseForMinig);
        });
        it('Get Miner Settings', async function () {
            chai_1.expect(await StreamerSettings_1.default.getMinerSettings(DatabaseForMinig))
                .to.deep.equal(new MinerSettings_1.MinerSettings(100)); // defauth value in db
        });
        it('Mining Maneger', async function () {
            let minerSettings = new MinerSettings_1.MinerSettings(HourlyRewardForTest);
            let UpdateMinerResult = await StreamerSettings_1.default.UpdateMinerSettings(DatabaseForMinig, minerSettings);
            chai_1.expect(UpdateMinerResult).to.deep.include({ SuccessfullyUpdatedMinerSettings: minerSettings });
            let MinerSettingsResult = await StreamerSettings_1.default.getMinerSettings(DatabaseForMinig);
            chai_1.expect(MinerSettingsResult).to.deep.equal(minerSettings);
        });
        it('Mining Coins', async function () {
            this.slow(1500);
            let result1 = await dbMinerManager_1.default.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
            chai_1.expect(result1).to.include({ CoinsOfUser: RewardForTestAttempt });
            await sleep(MinerSettings_1.MinimunTimeForMining);
            let result2 = await dbMinerManager_1.default.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
            chai_1.expect(result2).to.include({ CoinsOfUser: RewardForTestAttempt * 2 });
        });
    });
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const bluebird_1 = require("bluebird");
const PollStatus_1 = require("../services/models/poll/PollStatus");
const PollButton_1 = require("../services/models/poll/PollButton");
const Poll_1 = require("../services/models/poll/Poll");
const dbMinerManager_1 = require("../services/modules/database/miner/dbMinerManager");
const MinerSettings_1 = require("../services/models/miner/MinerSettings");
const dbWalletManager_1 = require("../services/modules/database/miner/dbWalletManager");
const PollController_1 = require("../services/controller/PollController");
const PollBeat_1 = require("../services/models/poll/PollBeat");
const dbStreamerManager_1 = require("../services/modules/database/dbStreamerManager");
const dbLoading_1 = require("../services/modules/database/dbLoading");
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
function createDatabase(StreamersID) {
    return __awaiter(this, void 0, void 0, function* () {
        let CreateResult = yield dbStreamerManager_1.dbStreamerManager.CreateStreamerDataBase(StreamersID);
        yield dbLoading_1.Loading.StreamerDatabase(StreamersID);
        return CreateResult;
    });
}
function deleteDatabse(StreamersID) {
    return __awaiter(this, void 0, void 0, function* () {
        return dbStreamerManager_1.dbStreamerManager.DeleteStreamerDataBase(StreamersID);
    });
}
function createPoll(StreamersID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new PollController_1.PollController(StreamersID).CreatePoll();
    });
}
function startPoll(StreamersID) {
    return __awaiter(this, void 0, void 0, function* () {
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(StreamersID);
        AccountData.CurrentPollStatus.PollStarted = true;
        return new PollController_1.PollController(StreamersID).UpdatePoll([
            new PollButton_1.PollButton(0, 'wait', '#FFFFFF', false),
            new PollButton_1.PollButton(1, 'black', '#000000', false)
        ]);
    });
}
describe('DATABASE_MANAGER', () => {
    after(() => __awaiter(void 0, void 0, void 0, function* () { yield deleteDatabse(IDForCreate); }));
    it('CreateStreamerDataBase', function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.expect(yield createDatabase(IDForCreate)).to.include.keys('StreamerDataBaseCreated');
        });
    });
    describe('Poll', () => {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield createDatabase(IDForManagerPoll);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield deleteDatabse(IDForManagerPoll);
            });
        });
        it('Load poll already created in db already created', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let Poll = yield new PollController_1.PollController(DatabasePreCreated).getCurrentPoll();
                chai_1.expect(Poll.PollStatus).to.deep.equal(new PollStatus_1.PollStatus().start().stop());
                chai_1.expect(Poll.PollButtons).to.deep.equal([
                    new PollButton_1.PollButton(0, '', '#ed8e3b', true),
                    new PollButton_1.PollButton(1, '', '#efc289', false)
                ]);
                chai_1.expect(Poll.Bets).to.deep.equal([]);
            });
        });
        it('First Get Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.expect((yield new PollController_1.PollController(IDForManagerPoll).getCurrentPoll()).PollStatus)
                    .to.deep.equal(new PollStatus_1.PollStatus().waxe());
            });
        });
        it('CreatePoll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.expect(yield new PollController_1.PollController(IDForManagerPoll).CreatePoll()).to.include.keys('PollCreated');
            });
        });
        var ButtonsToTest = [];
        it('Start Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll);
                AccountData.CurrentPollStatus.start();
                ButtonsToTest.push(new PollButton_1.PollButton(0, 'waite', '#FFFFFF', false));
                ButtonsToTest.push(new PollButton_1.PollButton(1, 'black', '#000000', false));
                let UpdatePollResult = yield new PollController_1.PollController(IDForManagerPoll).UpdatePoll(ButtonsToTest);
                chai_1.expect(UpdatePollResult.UpdatePollStatusRes).to.include({ PollStarted: true });
                chai_1.expect(UpdatePollResult.UpdateButtonGroupRes).to.include({ CreatedButtons: 2, UpdatedButtons: 0, DeletedButtons: 0 });
            });
        });
        it('Get Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let poll = yield new PollController_1.PollController(IDForManagerPoll).getCurrentPoll();
                let PollForTest = new PollStatus_1.PollStatus();
                PollForTest.PollStarted = true;
                chai_1.expect(poll.PollStatus).to.deep.equal(PollForTest);
                chai_1.expect(poll.PollButtons).to.deep.equal(ButtonsToTest);
            });
        });
        describe('Update Buttons', function () {
            this.timeout(4000);
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield createDatabase(DatabaseForUpdateButtons);
                    yield createPoll(DatabaseForUpdateButtons);
                    yield startPoll(DatabaseForUpdateButtons);
                });
            });
            after(() => __awaiter(this, void 0, void 0, function* () {
                yield deleteDatabse(DatabaseForUpdateButtons);
            }));
            it('Modify buttons', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.slow(300);
                    yield sleep(500);
                    let ButtonsToTest = [];
                    //ButtonsToTest.push(new PollButton(0,'waite','#FFFFFF',false))   // DELETE
                    ButtonsToTest.push(new PollButton_1.PollButton(1, 'black', '#000000', false));
                    ButtonsToTest.push(new PollButton_1.PollButton(2, 'black', '#000020', false));
                    ButtonsToTest.push(new PollButton_1.PollButton(3, 'wait', '#FFFFFF', false)); // NEW
                    let pollController = new PollController_1.PollController(DatabaseForUpdateButtons);
                    chai_1.expect((yield pollController.UpdatePoll(ButtonsToTest)).UpdateButtonGroupRes).to.include({ CreatedButtons: 2, UpdatedButtons: 1, DeletedButtons: 1 });
                    let poll = yield pollController.getCurrentPoll();
                    let pollForComper = new Poll_1.Poll(new PollStatus_1.PollStatus().start(), ButtonsToTest, new Date().getTime(), undefined, []);
                    chai_1.expect(poll.PollStatus).to.deep.equal(pollForComper.PollStatus);
                    chai_1.expect(poll.PollButtons).to.deep.equal(pollForComper.PollButtons);
                    chai_1.expect(poll.Bets).to.deep.equal(pollForComper.Bets);
                });
            });
        });
        it('Stop Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.stop();
                chai_1.expect((yield new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                    .to.include({ PollStarted: true, PollStoped: true });
            });
        });
        it('Restart Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.restart();
                chai_1.expect((yield new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                    .to.include({ PollStarted: true, PollStoped: false });
            });
        });
        it('Waxe Poll', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dbStreamerManager_1.dbStreamerManager.getAccountData(IDForManagerPoll).CurrentPollStatus.waxe();
                chai_1.expect((yield new PollController_1.PollController(IDForManagerPoll).UpdatePoll(undefined)).UpdatePollStatusRes)
                    .to.include({ PollWaxed: true });
            });
        });
        describe('Distribution', function () {
            this.timeout(6000);
            before(() => __awaiter(this, void 0, void 0, function* () {
                yield createDatabase(IDForDistribuition);
                yield createPoll(IDForDistribuition);
                yield startPoll(IDForDistribuition);
                yield new dbWalletManager_1.WalletManeger(IDForDistribuition, UsersIdsForTests[0]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistribuition, UsersIdsForTests[1]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistribuition, UsersIdsForTests[2]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistribuition, UsersIdsForTests[3]).deposit(50);
                ///////////////////////////////////////////////////////////////////////////////
                yield createDatabase(IDForDistributionOfmultipleResults);
                yield createPoll(IDForDistributionOfmultipleResults);
                yield startPoll(IDForDistributionOfmultipleResults);
                yield new dbWalletManager_1.WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[0]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[1]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[2]).deposit(50);
                yield new dbWalletManager_1.WalletManeger(IDForDistributionOfmultipleResults, UsersIdsForTests[3]).deposit(50);
            }));
            after(() => __awaiter(this, void 0, void 0, function* () {
                yield deleteDatabse(IDForDistribuition);
                yield deleteDatabse(IDForDistributionOfmultipleResults);
            }));
            it('Add Bet', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let pollController = new PollController_1.PollController(IDForDistribuition);
                    const BetAmontForTest_I = 2;
                    const BetAmontForTest_III = 2000;
                    let addBetResult_I = yield pollController.AddBet(UsersIdsForTests[0], 1, BetAmontForTest_I);
                    yield pollController.AddBet(UsersIdsForTests[1], 0, BetAmontForTest_I);
                    yield pollController.AddBet(UsersIdsForTests[2], 0, BetAmontForTest_I);
                    let Poll = yield pollController.getCurrentPoll();
                    chai_1.expect(Poll.Bets).to.deep.equal([
                        new PollBeat_1.PollBeat(0).setNumberOfBets(2),
                        new PollBeat_1.PollBeat(1).setNumberOfBets(1)
                    ]);
                    chai_1.expect(addBetResult_I).to.deep.equal({ BetAcepted: { Bet: BetAmontForTest_I } });
                    //Tests if the answer or a bottomless bet returns an error
                    yield pollController.AddBet(UsersIdsForTests[3], 1, BetAmontForTest_III)
                        .catch((addBetResult_III) => {
                        chai_1.expect(addBetResult_III.RequestError).to.exist.and.have.key('InsufficientFunds');
                        return bluebird_1.resolve();
                    });
                });
            });
            function waitResult(pollController, onCompleted) {
                return __awaiter(this, void 0, void 0, function* () {
                    let Poll = yield pollController.getCurrentPoll();
                    if (Poll.PollStatus.DistributionCompleted) {
                        yield onCompleted();
                    }
                    else
                        waitResult(pollController, onCompleted);
                    yield sleep(50);
                });
            }
            it('Distribution', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let pollController = new PollController_1.PollController(IDForDistribuition);
                    yield pollController.AddBet(UsersIdsForTests[0], 0, 25);
                    yield pollController.AddBet(UsersIdsForTests[1], 1, 25);
                    let ButtonsToTestWithWinners = [
                        new PollButton_1.PollButton(0, 'wait', '#FFFFFF', false),
                        new PollButton_1.PollButton(1, 'black', '#000000', true)
                    ];
                    let wallet_I = yield dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[0]);
                    let wallet_II = yield dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[1]);
                    chai_1.expect(wallet_I.Coins).to.deep.equal(50);
                    chai_1.expect(wallet_II.Coins).to.deep.equal(50);
                    chai_1.expect(yield pollController.StartDistribuition(ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');
                    yield waitResult(pollController, () => __awaiter(this, void 0, void 0, function* () {
                        let wallet_I = yield dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[0]);
                        let wallet_II = yield dbWalletManager_1.getWallet(IDForDistribuition, UsersIdsForTests[1]);
                        chai_1.expect(wallet_I.Coins).to.deep.equal(25);
                        chai_1.expect(wallet_II.Coins).to.deep.equal(77);
                    }));
                });
            });
            it('Distribution for multiple results', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(4000);
                    let pollController = new PollController_1.PollController(IDForDistributionOfmultipleResults);
                    yield pollController.AddBet(UsersIdsForTests[0], 1, 25);
                    yield pollController.AddBet(UsersIdsForTests[1], 1, 25);
                    yield pollController.AddBet(UsersIdsForTests[2], 2, 50);
                    yield pollController.AddBet(UsersIdsForTests[3], 3, 30);
                    let wallet = [];
                    for (let i = 0; i < 4; i++) {
                        wallet[i] = yield dbWalletManager_1.getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
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
                    chai_1.expect(yield pollController.StartDistribuition(ButtonsToTestWithWinners)).to.include.keys('DistributionStarted');
                    yield waitResult(pollController, () => __awaiter(this, void 0, void 0, function* () {
                        let wallet = [];
                        for (let i = 0; i < 4; i++) {
                            wallet[i] = yield dbWalletManager_1.getWallet(IDForDistributionOfmultipleResults, UsersIdsForTests[i]);
                        }
                        chai_1.expect(wallet[0].Coins).to.deep.equal(25);
                        chai_1.expect(wallet[1].Coins).to.deep.equal(25);
                        chai_1.expect(wallet[2].Coins).to.deep.equal(81.25);
                        chai_1.expect(wallet[3].Coins).to.deep.equal(68.75);
                    }));
                });
            });
        });
    });
    describe('Mining', function () {
        before(() => __awaiter(this, void 0, void 0, function* () {
            yield createDatabase(DatabaseForMinig);
        }));
        after(() => __awaiter(this, void 0, void 0, function* () {
            yield deleteDatabse(DatabaseForMinig);
        }));
        it('Get Miner Settings', function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.expect(yield dbMinerManager_1.MinerManeger.getMinerSettings(DatabaseForMinig))
                    .to.deep.equal(new MinerSettings_1.MinerSettings(100)); // defauth value in db
            });
        });
        it('Mining Maneger', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let minerSettings = new MinerSettings_1.MinerSettings(HourlyRewardForTest);
                let UpdateMinerResult = yield dbMinerManager_1.MinerManeger.UpdateSettings(DatabaseForMinig, minerSettings);
                chai_1.expect(UpdateMinerResult).to.deep.include({ SuccessfullyUpdatedMinerSettings: minerSettings });
                let MinerSettingsResult = yield dbMinerManager_1.MinerManeger.getMinerSettings(DatabaseForMinig);
                chai_1.expect(MinerSettingsResult).to.deep.equal(minerSettings);
            });
        });
        it('Mining Coins', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.slow(1500);
                let result1 = yield dbMinerManager_1.MinerManeger.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
                chai_1.expect(result1).to.include({ CoinsOfUser: RewardForTestAttempt });
                yield sleep(MinerSettings_1.MinimunTimeForMining);
                let result2 = yield dbMinerManager_1.MinerManeger.MineCoin(DatabaseForMinig, UsersIdsForTests[0]);
                chai_1.expect(result2).to.include({ CoinsOfUser: RewardForTestAttempt * 2 });
            });
        });
    });
});

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
const utils_1 = require("../../utils/utils");
const BackendConnection_1 = require("../BackendConnection");
const Miner_1 = require("./modules/Miner");
const View_1 = require("./View");
function makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
var token, StreamerID, TwitchUserID;
const twitch = window.Twitch.ext;
var CurrentPollStatus = null;
function IsWinner(PollButtons, ChosenButtonID) {
    let WinningButtons = [];
    PollButtons.forEach(button => {
        if (button.IsWinner) {
            WinningButtons.push(button);
        }
    });
    let is_winner = false;
    WinningButtons.forEach(WinningButton => {
        if (WinningButton.ID === ChosenButtonID)
            is_winner = true;
    });
    return is_winner;
}
twitch.onAuthorized((auth) => __awaiter(void 0, void 0, void 0, function* () {
    twitch.onContext((context) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(context);
        var gameBoard = new View_1.GameBoard();
        token = auth.token;
        StreamerID = auth.channelId.toLowerCase();
        if (process.env.NODE_ENV === 'production') {
            TwitchUserID = auth.userId.toLowerCase();
        }
        else {
            TwitchUserID = makeid(5);
        }
        let ChangeBeat = () => {
            if (gameBoard.SelectedButtonID !== null) {
                gameBoard.BetAmountInput.setChangedInput();
                BackendConnection_1.addBet(StreamerID, TwitchUserID, gameBoard.SelectedButtonID, gameBoard.getBetValue())
                    .then(() => __awaiter(void 0, void 0, void 0, function* () {
                    gameBoard.BetAmountInput.setInputSentSuccessfully();
                    yield utils_1.sleep(100);
                    gameBoard.BetAmountInput.setUnchangedInput();
                }))
                    .catch(() => {
                    gameBoard.BetAmountInput.setInputSentError();
                });
            }
            else {
                gameBoard.BetAmountInput.setInputSentError();
            }
        };
        gameBoard.onBeatIDSelected = ChangeBeat;
        gameBoard.BetAmountInput.HTMLInput.onchange = ChangeBeat;
        new BackendConnection_1.WatchPoll(StreamerID)
            .setOnPollChange((Poll) => __awaiter(void 0, void 0, void 0, function* () {
            if (utils_1.isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
                gameBoard.setButtonsInPollDiv(Poll.PollButtons);
            }
            else {
                if (Poll.PollStatus.PollWaxed) {
                    yield gameBoard.HideAllAlerts();
                }
                else {
                    if (Poll.PollStatus.PollStarted) {
                        if (Poll.PollStatus.DistributionCompleted) {
                            if (isNaN(gameBoard.SelectedButtonID)) {
                                yield gameBoard.HideAllAlerts();
                            }
                            else {
                                if (IsWinner(Poll.PollButtons, gameBoard.SelectedButtonID)) {
                                    gameBoard.setInWinnerMode(Poll.LossDistributorOfPoll);
                                }
                                else {
                                    gameBoard.setInLoserMode();
                                }
                            }
                        }
                        else if (Poll.PollStatus.PollStoped) {
                            gameBoard.setInStopedMode();
                        }
                        else if (Poll.PollStatus.PollStarted) {
                            gameBoard.setInBetMode(Poll.PollButtons);
                        }
                    }
                }
                CurrentPollStatus = Poll.PollStatus;
            }
        }))
            .start();
        let WalletOfUser = yield BackendConnection_1.GetWallet(StreamerID, TwitchUserID);
        twitch.rig.log(WalletOfUser.Coins.toString());
        gameBoard.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();
        new Miner_1.Miner(StreamerID, TwitchUserID, WalletOfUser.Coins, (CurrentCoinsOfUsernulber, CoinsAddedOrSubtracted) => {
            if (CoinsAddedOrSubtracted > 0) {
                gameBoard.startDepositAnimation(~~CoinsAddedOrSubtracted + 1);
            }
            else {
                if (CoinsAddedOrSubtracted <= -1) {
                    gameBoard.startWithdrawalAnimation((~~CoinsAddedOrSubtracted + 1) * -1);
                }
            }
            gameBoard.CoinsOfUserView.innerText = (~~CurrentCoinsOfUsernulber).toString();
            //TODO ADD METODO PARA MUDAR UI}).startMining()
        }).startMining();
    }));
}));

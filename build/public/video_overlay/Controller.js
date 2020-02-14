"use strict";
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
twitch.onAuthorized(async (auth) => {
    twitch.onContext(async (context) => {
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
                    .then(async () => {
                    gameBoard.BetAmountInput.setInputSentSuccessfully();
                    await utils_1.sleep(100);
                    gameBoard.BetAmountInput.setUnchangedInput();
                })
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
            .setOnPollChange(async (Poll) => {
            if (utils_1.isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
                gameBoard.setButtonsInPollDiv(Poll.PollButtons);
            }
            else {
                if (Poll.PollStatus.PollWaxed) {
                    await gameBoard.HideAllAlerts();
                }
                else {
                    if (Poll.PollStatus.PollStarted) {
                        if (Poll.PollStatus.DistributionCompleted) {
                            if (isNaN(gameBoard.SelectedButtonID)) {
                                await gameBoard.HideAllAlerts();
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
        })
            .start();
        let WalletOfUser = await BackendConnection_1.GetWallet(StreamerID, TwitchUserID);
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
        let StoreItens = await BackendConnection_1.GetStore(StreamerID);
        gameBoard.setStoreItems(StoreItens);
    });
});

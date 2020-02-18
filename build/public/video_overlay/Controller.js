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
        const GAME_BOARD = new View_1.GameBoard();
        token = auth.token;
        StreamerID = auth.channelId.toLowerCase();
        if (process.env.NODE_ENV === 'production') {
            TwitchUserID = auth.userId.toLowerCase();
        }
        else {
            TwitchUserID = makeid(5);
        }
        let ChangeBeat = () => {
            if (GAME_BOARD.SelectedButtonID !== null) {
                GAME_BOARD.BetAmountInput.setChangedInput();
                BackendConnection_1.addBet(StreamerID, TwitchUserID, GAME_BOARD.SelectedButtonID, GAME_BOARD.getBetValue())
                    .then(async () => {
                    GAME_BOARD.BetAmountInput.setInputSentSuccessfully();
                    await utils_1.sleep(100);
                    GAME_BOARD.BetAmountInput.setUnchangedInput();
                })
                    .catch(() => {
                    GAME_BOARD.BetAmountInput.setInputSentError();
                });
            }
            else {
                GAME_BOARD.BetAmountInput.setInputSentError();
            }
        };
        GAME_BOARD.onBeatIDSelected = ChangeBeat;
        GAME_BOARD.BetAmountInput.HTMLInput.onchange = ChangeBeat;
        new BackendConnection_1.WatchPoll(StreamerID)
            .setOnPollChange(async (Poll) => {
            if (utils_1.isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
                GAME_BOARD.setButtonsInPollDiv(Poll.PollButtons);
            }
            else {
                if (Poll.PollStatus.PollWaxed) {
                    await GAME_BOARD.HideAllAlerts();
                }
                else {
                    if (Poll.PollStatus.PollStarted) {
                        if (Poll.PollStatus.DistributionCompleted) {
                            if (isNaN(GAME_BOARD.SelectedButtonID)) {
                                await GAME_BOARD.HideAllAlerts();
                            }
                            else {
                                if (IsWinner(Poll.PollButtons, GAME_BOARD.SelectedButtonID)) {
                                    GAME_BOARD.setInWinnerMode(Poll.LossDistributorOfPoll);
                                }
                                else {
                                    GAME_BOARD.setInLoserMode();
                                }
                            }
                        }
                        else if (Poll.PollStatus.PollStoped) {
                            GAME_BOARD.setInStopedMode();
                        }
                        else if (Poll.PollStatus.PollStarted) {
                            GAME_BOARD.setInBetMode(Poll.PollButtons);
                        }
                    }
                }
                CurrentPollStatus = Poll.PollStatus;
            }
        })
            .start();
        let WalletOfUser = await BackendConnection_1.GetWallet(StreamerID, TwitchUserID);
        twitch.rig.log(WalletOfUser.Coins.toString());
        GAME_BOARD.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();
        new Miner_1.Miner(StreamerID, TwitchUserID, WalletOfUser.Coins, (CurrentCoinsOfUsernulber, CoinsAddedOrSubtracted) => {
            if (CoinsAddedOrSubtracted > 0) {
                GAME_BOARD.startDepositAnimation(~~CoinsAddedOrSubtracted + 1);
            }
            else {
                if (CoinsAddedOrSubtracted <= -1) {
                    GAME_BOARD.startWithdrawalAnimation((~~CoinsAddedOrSubtracted + 1) * -1);
                }
            }
            GAME_BOARD.CoinsOfUserView.innerText = (~~CurrentCoinsOfUsernulber).toString();
            //TODO ADD METODO PARA MUDAR UI}).startMining()
        }).startMining();
        GAME_BOARD.setStoreItems(await BackendConnection_1.GetStore(StreamerID, -1));
        GAME_BOARD.onBuyItemButtonActive = (StoreItem) => {
            BackendConnection_1.BuyStoreItem(StreamerID, TwitchUserID, StoreItem)
                .then((res) => {
                console.log(res);
            })
                .catch((rej) => {
                console.log(rej);
            });
        };
    });
});

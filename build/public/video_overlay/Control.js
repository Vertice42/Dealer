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
const View_1 = require("./View");
/*
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
*/
var token, StreamerID, TwitchUserID;
const twitch = window.Twitch.ext;
twitch.onContext((context) => {
    console.log(context);
});
twitch.onAuthorized((auth) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(auth);
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    TwitchUserID = auth.userId.toLowerCase();
    const GAME_BOARD = new View_1.GameBoard();
    var CurrentPollStatus = null;
    var CoinsOfUser = 0;
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
    GAME_BOARD.OnInpustsChange = () => {
        if (GAME_BOARD.SelectedButtonID !== undefined)
            BackendConnection_1.addBet(StreamerID, TwitchUserID, GAME_BOARD.SelectedButtonID, GAME_BOARD.getBetValue());
    };
    var onPollChange = (Poll) => {
        //TODO ADD is bet 
        if (utils_1.isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
            GAME_BOARD.setButtonsInPollDiv(Poll.PollButtons);
        }
        else {
            if (Poll.PollStatus) {
                if (!Poll.PollStatus.PollWaxed || Poll.PollStatus.PollStarted) {
                    if (Poll.PollStatus.DistributionCompleted) {
                        if (GAME_BOARD.SelectedButtonID === null) {
                            GAME_BOARD.HideAll(null);
                        }
                        else {
                            if (IsWinner(Poll.PollButtons, GAME_BOARD.SelectedButtonID))
                                GAME_BOARD.setInWinnerMode(Poll.LossDistributorOfPoll);
                            else
                                GAME_BOARD.setInLoserMode();
                        }
                    }
                    else if (Poll.PollStatus.PollStoped) {
                        GAME_BOARD.setInStopMode();
                    }
                    else if (Poll.PollStatus.PollStarted) {
                        GAME_BOARD.setInBetMode(Poll.PollButtons);
                    }
                }
                else {
                    GAME_BOARD.HideAll(null);
                }
            }
            else {
                GAME_BOARD.HideAll(null);
            }
            CurrentPollStatus = Poll.PollStatus;
        }
    };
    let watchPoll = new BackendConnection_1.WatchPoll(StreamerID);
    watchPoll.onPollChange = (Poll) => {
        onPollChange(Poll);
    };
    watchPoll.start();
    var onSuccessfullyMined = (MiningResponse) => {
        let diference = ~~MiningResponse.CoinsOfUser - CoinsOfUser;
        if (diference > 0) {
            GAME_BOARD.startDepositAnimation(~~diference + 1);
        }
        else if (diference <= -1)
            GAME_BOARD.startWithdrawalAnimation((~~diference + 1) * -1);
        CoinsOfUser = MiningResponse.CoinsOfUser;
        GAME_BOARD.CoinsOfUserView.innerText = (~~CoinsOfUser).toString();
        setTimeout(() => {
            Mine();
        }, 1000);
    };
    function Mine() {
        BackendConnection_1.MineCoin(StreamerID, TwitchUserID).then((res) => {
            onSuccessfullyMined(res);
        }).catch((error) => {
            console.log('Error connecting to Mine Service, next attempt in 3s');
            setTimeout(() => {
                Mine();
            }, 3000);
        });
    }
    Mine();
}));

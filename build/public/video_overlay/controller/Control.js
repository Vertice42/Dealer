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
const utils_1 = require("../../../utils/utils");
const BackendConnection_1 = require("../../BackendConnection");
const View_1 = require("../../video_overlay/View");
const Wallet_1 = require("../modules/Wallet");
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
var CurrentPollStatus = null;
twitch.onContext((context) => {
    console.log(context);
});
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
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    TwitchUserID = auth.userId.toLowerCase();
    View_1.default.OnBeatChange = () => {
        if (View_1.default.SelectedButtonID !== undefined)
            BackendConnection_1.addBet(StreamerID, TwitchUserID, View_1.default.SelectedButtonID, View_1.default.getBetValue());
    };
    new BackendConnection_1.WatchPoll(StreamerID)
        .setOnPollChange((Poll) => {
        //TODO ADD is bet 
        if (utils_1.isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
            View_1.default.setButtonsInPollDiv(Poll.PollButtons);
        }
        else {
            if (Poll.PollStatus.PollWaxed) {
                View_1.default.HideAll(null);
            }
            else {
                if (Poll.PollStatus.PollStarted) {
                    if (Poll.PollStatus.DistributionCompleted) {
                        if (!View_1.default.SelectedButtonID) {
                            View_1.default.HideAll(null);
                        }
                        else {
                            if (IsWinner(Poll.PollButtons, View_1.default.SelectedButtonID))
                                View_1.default.setInWinnerMode(Poll.LossDistributorOfPoll);
                            else
                                View_1.default.setInLoserMode();
                        }
                    }
                    else if (Poll.PollStatus.PollStoped) {
                        View_1.default.setInStopMode();
                    }
                    else if (Poll.PollStatus.PollStarted) {
                        View_1.default.setInBetMode(Poll.PollButtons);
                    }
                }
            }
            CurrentPollStatus = Poll.PollStatus;
        }
    })
        .start();
    twitch.rig.log(new Date().toString());
    let wallet = yield BackendConnection_1.GetWallet(StreamerID, TwitchUserID);
    twitch.rig.log(wallet.Coins.toString());
    View_1.default.CoinsOfUserView.innerText = wallet.Coins.toString();
    new Wallet_1.Miner(StreamerID, TwitchUserID, wallet.Coins).TryToMine();
}));

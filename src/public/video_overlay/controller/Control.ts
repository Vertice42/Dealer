import { PollStatus } from "../../../services/models/poll/PollStatus";
import { PollButton } from "../../../services/models/poll/PollButton";
import { isEquivalent } from "../../../utils/utils";
import { WatchPoll, addBet as addBeat, GetWallet } from "../../BackendConnection";
import { Poll } from "../../../services/models/poll/Poll";
import GameBoard from "../../video_overlay/View"
import { Miner } from "../modules/Wallet";
import { dbWallet } from "../../../services/models/poll/dbWallet";
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

var CurrentPollStatus: PollStatus = null;
twitch.onContext((context) => {
  console.log(context);
})

function IsWinner(PollButtons: PollButton[], ChosenButtonID: number) {
  let WinningButtons: PollButton[] = [];
  PollButtons.forEach(button => {
    if (button.IsWinner) {
      WinningButtons.push(button);
    }
  });

  let is_winner = false;
  WinningButtons.forEach(WinningButton => {
    if (WinningButton.ID === ChosenButtonID) is_winner = true;
  });
  return is_winner;
}

twitch.onAuthorized(async (auth) => {
  token = auth.token;
  StreamerID = auth.channelId.toLowerCase();
  TwitchUserID = auth.userId.toLowerCase();

  GameBoard.OnBeatChange = () => {
    if (GameBoard.SelectedButtonID !== undefined)
      addBeat(
        StreamerID,
        TwitchUserID,
        GameBoard.SelectedButtonID,
        GameBoard.getBetValue());
  }

  new WatchPoll(StreamerID)
    .setOnPollChange((Poll: Poll) => {
      //TODO ADD is bet 
      if (isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
        GameBoard.setButtonsInPollDiv(Poll.PollButtons);

      } else {
        if (Poll.PollStatus.PollWaxed) {
          GameBoard.HideAll(null);
        } else {
          if (Poll.PollStatus.PollStarted) {
            if (Poll.PollStatus.DistributionCompleted) {
              if (!GameBoard.SelectedButtonID) {
                GameBoard.HideAll(null);
              } else {
                if (IsWinner(Poll.PollButtons, GameBoard.SelectedButtonID))
                  GameBoard.setInWinnerMode(Poll.LossDistributorOfPoll);
                else
                  GameBoard.setInLoserMode();
              }
            } else if (Poll.PollStatus.PollStoped) {
              GameBoard.setInStopMode();
            } else if (Poll.PollStatus.PollStarted) {
              GameBoard.setInBetMode(Poll.PollButtons);
            }
          }
        }
        CurrentPollStatus = Poll.PollStatus;
      }
    })
    .start();
  twitch.rig.log(new Date().toString())
  let wallet: dbWallet = await GetWallet(StreamerID, TwitchUserID);
  twitch.rig.log(wallet.Coins.toString());

  GameBoard.CoinsOfUserView.innerText = wallet.Coins.toString();
  new Miner(StreamerID, TwitchUserID, wallet.Coins).TryToMine();

})
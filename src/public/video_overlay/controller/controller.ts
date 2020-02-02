import { PollStatus } from "../../../services/models/poll/PollStatus";
import { PollButton } from "../../../services/models/poll/PollButton";
import { isEquivalent } from "../../../utils/utils";
import { WatchPoll, addBet as addBeat, GetWallet } from "../../BackendConnection";
import { MiningResponse } from "../../../services/models/miner/MiningResponse";
import { Poll } from "../../../services/models/poll/Poll";
import { Miner } from "../modules/Wallet";
import { dbWallet } from "../../../services/models/poll/dbWallet";
import { GameBoard } from "../View";
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
var gameBoard = new GameBoard()
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

  gameBoard.OnBeatChange = () => {
    if (gameBoard.SelectedButtonID !== undefined)
      addBeat(
        StreamerID,
        TwitchUserID,
        gameBoard.SelectedButtonID,
        gameBoard.getBetValue());
  }

  new WatchPoll(StreamerID)
    .setOnPollChange(async (Poll: Poll) => {
      //TODO ADD is bet 
      if (isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
        gameBoard.setButtonsInPollDiv(Poll.PollButtons);

      } else {
        if (Poll.PollStatus.PollWaxed) {
          await gameBoard.HideAllAlerts();
        } else {
          if (Poll.PollStatus.PollStarted) {
            if (Poll.PollStatus.DistributionCompleted) {
              if (!gameBoard.SelectedButtonID) {
                await gameBoard.HideAllAlerts();
              } else {
                if (IsWinner(Poll.PollButtons, gameBoard.SelectedButtonID))
                  gameBoard.setInWinnerMode(Poll.LossDistributorOfPoll);
                else
                  gameBoard.setInLoserMode();
              }
            } else if (Poll.PollStatus.PollStoped) {
              gameBoard.setInStopMode();
            } else if (Poll.PollStatus.PollStarted) {
              gameBoard.setInBetMode(Poll.PollButtons);
            }
          }
        }
        CurrentPollStatus = Poll.PollStatus;
      }
    })
    .start();

  let WalletOfUser: dbWallet = await GetWallet(StreamerID, TwitchUserID);
  twitch.rig.log(WalletOfUser.Coins.toString());
  gameBoard.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

  new Miner(StreamerID, TwitchUserID, WalletOfUser.Coins,
    (CurrentCoinsOfUsernulber, CoinsAddedOrSubtracted: number) => {

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
    }).startMining()
});
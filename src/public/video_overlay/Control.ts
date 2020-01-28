import { PollStatus } from "../../services/models/poll/PollStatus";
import { PollButton } from "../../services/models/poll/PollButton";
import { isEquivalent } from "../../utils/utils";
import { WatchPoll, MineCoin, addBet } from "../BackendConnection";
import { MiningResult } from "../../services/models/miner/MiningResult";
import { Poll } from "../../services/models/poll/Poll";
import { GameBoard } from "./View";

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
})

twitch.onAuthorized(async (auth) => {

  console.log(auth);
  
  token = auth.token;
  StreamerID = auth.channelId.toLowerCase();
  TwitchUserID = auth.userId.toLowerCase();

  const GAME_BOARD = new GameBoard();
  var CurrentPollStatus: PollStatus = null;
  var CoinsOfUser = 0;


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

  GAME_BOARD.OnInpustsChange = () => {
    if (GAME_BOARD.SelectedButtonID !== undefined)
      addBet(
        StreamerID,
        TwitchUserID,
        GAME_BOARD.SelectedButtonID,
        GAME_BOARD.getBetValue());
  }

  var onPollChange = (Poll: Poll) => {
    //TODO ADD is bet 
    if (isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
      GAME_BOARD.setButtonsInPollDiv(Poll.PollButtons);

    } else {

      if (Poll.PollStatus) {
        if (!Poll.PollStatus.PollWaxed || Poll.PollStatus.PollStarted) {
          if (Poll.PollStatus.DistributionCompleted) {
            if (GAME_BOARD.SelectedButtonID === null) {
              GAME_BOARD.HideAll(null);
            } else {
              if (IsWinner(Poll.PollButtons, GAME_BOARD.SelectedButtonID))
                GAME_BOARD.setInWinnerMode(Poll.LossDistributorOfPoll);
              else
                GAME_BOARD.setInLoserMode();
            }
          } else if (Poll.PollStatus.PollStoped) {
            GAME_BOARD.setInStopMode();
          } else if (Poll.PollStatus.PollStarted) {
            GAME_BOARD.setInBetMode(Poll.PollButtons);
          }
        } else {
          GAME_BOARD.HideAll(null);
        }
      } else {
        GAME_BOARD.HideAll(null);
      }
      CurrentPollStatus = Poll.PollStatus;
    }
  }

  let watchPoll = new WatchPoll(StreamerID);
  watchPoll.onPollChange = (Poll: Poll) => {
    onPollChange(Poll);
  }
  watchPoll.start();

  var onSuccessfullyMined = (MiningResponse: MiningResult) => {
    let diference = ~~MiningResponse.CoinsOfUser - CoinsOfUser;

    if (diference > 0) {
      GAME_BOARD.startDepositAnimation(~~diference + 1);
    }
    else
      if (diference <= -1)
        GAME_BOARD.startWithdrawalAnimation((~~diference + 1) * -1);

    CoinsOfUser = MiningResponse.CoinsOfUser;
    GAME_BOARD.CoinsOfUserView.innerText = (~~CoinsOfUser).toString();

    setTimeout(() => {
      Mine()
    }, 1000);
  }

  function Mine() {
    MineCoin(StreamerID, TwitchUserID).then((res) => {
      onSuccessfullyMined(res);
    }).catch((error) => {
      console.log('Error connecting to Mine Service, next attempt in 3s');
      setTimeout(() => {
        Mine();
      }, 3000);
    })
  }
  Mine();

})
import { PollStatus } from "../../services/models/poll/PollStatus";
import { PollButton } from "../../services/models/poll/PollButton";
import { isEquivalent, sleep } from "../../utils/utils";
import { WatchPoll, addBet as addBeat, GetWallet, GetStore, addPurchaseOrder } from "../BackendConnection";
import { Poll } from "../../services/models/poll/Poll";
import { Miner } from "./modules/Miner";
import { dbWallet } from "../../services/models/poll/dbWallet";
import { GameBoard } from "./View";
import StoreItem from "../../services/models/store/StoreItem";

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

var token, StreamerID, TwitchUserID;
const twitch = window.Twitch.ext;

var CurrentPollStatus: PollStatus = null;


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
  twitch.onContext(async (context) => {
    console.log(context);

    const GAME_BOARD = new GameBoard();
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    if (process.env.NODE_ENV === 'production') {
      TwitchUserID = auth.userId.toLowerCase();
    } else {
      TwitchUserID = makeid(5)
    }

    let ChangeBeat = () => {
      if (GAME_BOARD.SelectedButtonID !== null) {
        GAME_BOARD.BetAmountInput.setChangedInput();
        addBeat(StreamerID, TwitchUserID, GAME_BOARD.SelectedButtonID, GAME_BOARD.getBetValue())
          .then(async () => {
            GAME_BOARD.BetAmountInput.setInputSentSuccessfully();
            await sleep(100);
            GAME_BOARD.BetAmountInput.setUnchangedInput();
          })
          .catch(() => {
            GAME_BOARD.BetAmountInput.setInputSentError();
          })
      } else {
        GAME_BOARD.BetAmountInput.setInputSentError();
      }
    }

    GAME_BOARD.onBeatIDSelected = ChangeBeat;
    GAME_BOARD.BetAmountInput.HTMLInput.onchange = ChangeBeat;

    new WatchPoll(StreamerID)
      .setOnPollChange(async (Poll: Poll) => {
        if (isEquivalent(CurrentPollStatus, Poll.PollStatus)) {
          GAME_BOARD.setButtonsInPollDiv(Poll.PollButtons);

        } else {
          if (Poll.PollStatus.PollWaxed) {
            await GAME_BOARD.HideAllAlerts();
          } else {
            if (Poll.PollStatus.PollStarted) {
              if (Poll.PollStatus.DistributionCompleted) {
                if (isNaN(GAME_BOARD.SelectedButtonID)) {
                  await GAME_BOARD.HideAllAlerts();
                } else {
                  if (IsWinner(Poll.PollButtons, GAME_BOARD.SelectedButtonID)) {
                    GAME_BOARD.setInWinnerMode(Poll.LossDistributorOfPoll);
                  } else {
                    GAME_BOARD.setInLoserMode();
                  }
                }
              } else if (Poll.PollStatus.PollStoped) {
                GAME_BOARD.setInStopedMode();
              } else if (Poll.PollStatus.PollStarted) {
                GAME_BOARD.setInBetMode(Poll.PollButtons);
              }
            }
          }
          CurrentPollStatus = Poll.PollStatus;
        }
      })
      .start();

    let WalletOfUser: dbWallet = await GetWallet(StreamerID, TwitchUserID);
    twitch.rig.log(WalletOfUser.Coins.toString());
    GAME_BOARD.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

    new Miner(StreamerID, TwitchUserID, WalletOfUser.Coins,
      (CurrentCoinsOfUsernulber, CoinsAddedOrSubtracted: number) => {

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

    GAME_BOARD.setStoreItems(await GetStore(StreamerID,-1));

    GAME_BOARD.onBuyItemButtonActive = (StoreItem:StoreItem) => {
      addPurchaseOrder(StreamerID,TwitchUserID,StoreItem)
      .then((res)=>{
        console.log(res);
      })
      .catch((rej)=>{
        console.log(rej);
        
      })
    }

  });
})
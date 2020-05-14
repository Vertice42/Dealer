import { Miner } from "../modules/Miner";
import AlertController from "./AlertController";
import { InsertTextInHardCode as InsertTextInElements, LocalizedTexts } from "../../common/view/Texts";
import { TwitchListener } from "../../common/model/TwitchListener";
import { getLocaleFile } from "../../common/BackendConnection/BlobFiles";
import { getUsername } from "../../common/BackendConnection/TwitchConnections";
import StoreDisplayController from "./StoreDisplayController";

function makeID(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

var TwitchListeners: TwitchListener[] = [];
var Initialized = false;
/**
 * Adds a new twitch listener or pub sub
 */
export function addTwitchListeners(TwitchListener: TwitchListener) {
  TwitchListeners.push(TwitchListener);
}

window.Twitch.ext.listen('broadcast', (topic, contentType, json: string) => {
  TwitchListeners.forEach((twitchListener) => {
    let jsonOBJ: TwitchListener = JSON.parse(json);

    if (jsonOBJ.ListenerName === twitchListener.ListenerName) {
      twitchListener.data(jsonOBJ.data)
    }

  });
});

export var Texts: LocalizedTexts;
window.Twitch.ext.onContext(async (context) => {
  var language = navigator.language.toLowerCase() || 'en';
  InsertTextInElements(await getLocaleFile('view_video_overlay_hard_code', language));

  if (Texts) {
    Texts.update(await getLocaleFile('view_video_overlay', language));
  } else {
    Texts = new LocalizedTexts(await getLocaleFile('view_video_overlay', language));
  }
});

window.Twitch.ext.onAuthorized(async (auth) => {
  var TwitchUserName = (await getUsername(auth.userId.replace(/[^\d]+/g, ''), auth.clientId)).name;

  if (!TwitchUserName) {
    document.body.style.display = 'none';
    return 'TwitchUserID undefined';
  }

  if (process.env.NODE_ENV !== 'production') {
    window.Twitch.ext.bits.setUseLoopback(true);
  }

  if (Initialized) return; else Initialized = true;

  await new AlertController(auth.token, auth.channelId, TwitchUserName).Build();

  var storeDisplayController = new StoreDisplayController(auth.token, auth.channelId, TwitchUserName);
  var MinerOfUser = new Miner(auth.channelId, TwitchUserName);
  MinerOfUser.onMine = (CurrentCoinsOfUserNumber, BalanceChange) => {
    storeDisplayController.ViewWalletDisplay.setViewBalance(CurrentCoinsOfUserNumber, BalanceChange)
  };
  MinerOfUser.startMining();

})
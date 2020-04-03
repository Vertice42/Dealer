import { Miner } from "../modules/Miner";
import AllertController from "./AlertController";
import StoreDisplayController from "./StoreDisplayController";
import { getUsername } from "../../TwitchConnections";
import { IncertTextInHardCode as IncertTextInElements, LocalizedTexts } from "../../common/model/IncertText";
import { getLocaleFile } from "../../BackendConnection";

function makeid(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export var Texts: LocalizedTexts;

var token: string, StreamerID: string, TwitchUserID: string;

var TwitchListeners: { ListenerName: string, Listerner: (data) => any }[] = [];

var Twitchbroadcast = (opic, contentType, json: string) => {
  TwitchListeners.forEach((twitchListener) => {
    let jsonOBJ: { ListenerName: string, data: any } = JSON.parse(json);

    if (jsonOBJ.ListenerName === twitchListener.ListenerName) {
      twitchListener.Listerner(jsonOBJ.data)
    }

  });
}

export function addTwitchListeners(ListenerName: string, Listerner: (data) => any) {
  TwitchListeners.push({ ListenerName, Listerner });
}
window.Twitch.ext.listen('broadcast', Twitchbroadcast);


window.Twitch.ext.onAuthorized(async (auth) => {

  StreamerID = auth.channelId.toLowerCase();
  token = auth.token;

  if (process.env.NODE_ENV === 'production') {
    TwitchUserID = auth.userId.toLowerCase();
    TwitchUserID = (await getUsername(TwitchUserID, auth.clientId)).name;
  }
  else {
    TwitchUserID = auth.userId.toLowerCase().replace('u', '');
    TwitchUserID = (await getUsername(TwitchUserID, auth.clientId)).name;
    TwitchUserID = makeid(5);
  }

  Texts = new LocalizedTexts(await getLocaleFile('view_video_overlay', 'en'));

  window.Twitch.ext.onContext(async (context) => {
    console.error(context);
    IncertTextInElements(await getLocaleFile('view_video_overlay_hard_code', context.language));
    Texts.update(await getLocaleFile('view_video_overlay',context.language));

    await new AllertController(StreamerID, TwitchUserID).Loading();
    var ControllerOfStoreDisplay = new StoreDisplayController(StreamerID, TwitchUserID);
    var UserMiner = new Miner(StreamerID, TwitchUserID);
    UserMiner.onMine = (CurrentCoinsOfUserNunber, BalanceChange) => {
      ControllerOfStoreDisplay.setViewBalance(CurrentCoinsOfUserNunber, BalanceChange)
    };
    UserMiner.startMining();
  });

})
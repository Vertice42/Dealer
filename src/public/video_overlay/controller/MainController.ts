import { Miner } from "../modules/Miner";
import AllertController from "./AlertController";
import StoreDisplayController from "./StoreDisplayController";
import { getUsername, getID } from "../../TwitchConnections";
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

var Token: string, StreamerID: string, TwitchUserName: string;

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
  Token = auth.token;

  if (process.env.NODE_ENV === 'production') {
    TwitchUserName = auth.userId;
    TwitchUserName = TwitchUserName.replace(/[^\d]+/g, '')
    TwitchUserName = (await getUsername(TwitchUserName, auth.clientId)).name;
  }
  else {
    TwitchUserName = auth.userId;
    TwitchUserName = TwitchUserName.replace(/[^\d]+/g, '')
    TwitchUserName = (await getUsername(TwitchUserName, auth.clientId)).name;

    //TwitchUserID = makeid(5);
  }

  if (!TwitchUserName) {
    document.body.style.display = 'none';
    return 'TwitchUserID undefined';
  }

  Texts = new LocalizedTexts(await getLocaleFile('view_video_overlay', 'en'));

  window.Twitch.ext.onContext(async (context) => {
    console.error(context);
    IncertTextInElements(await getLocaleFile('view_video_overlay_hard_code', context.language));
    Texts.update(await getLocaleFile('view_video_overlay', context.language));

    await new AllertController(auth.token, StreamerID, TwitchUserName).Loading();
    var ControllerOfStoreDisplay = new StoreDisplayController(Token, StreamerID, TwitchUserName);
    var UserMiner = new Miner(StreamerID, TwitchUserName);
    UserMiner.onMine = (CurrentCoinsOfUserNunber, BalanceChange) => {
      ControllerOfStoreDisplay.setViewBalance(CurrentCoinsOfUserNunber, BalanceChange)
    };
    UserMiner.startMining();
  });
})
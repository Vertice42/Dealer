import { Miner } from "../modules/Miner";
import AllertController from "./AlertController";
import StoreDisplayController from "./StoreDisplayController";

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
const twitch = window.Twitch.ext;

var token: string, StreamerID: string, TwitchUserID: string;

var TwitchListeners:{ListenerName:string,Listerner:(data)=>any}[] = [];

var Twitchbroadcast = (opic, contentType, json:string) => {  
  TwitchListeners.forEach((twitchListener) => {
    let jsonOBJ:{ListenerName:string,data:any} = JSON.parse(json);   
     
    if (jsonOBJ.ListenerName === twitchListener.ListenerName) {
      twitchListener.Listerner(jsonOBJ.data)
    }

  });
}

export function addTwitchListeners(ListenerName:string,Listerner:(data)=>any) {
  TwitchListeners.push({ListenerName,Listerner});
}
window.Twitch.ext.listen('broadcast', Twitchbroadcast);

twitch.onAuthorized(async (auth) => {

  twitch.onContext((context) => {
    console.log(context);
    token = auth.token;

    StreamerID = auth.channelId.toLowerCase();
    if (process.env.NODE_ENV === 'production') {
      TwitchUserID = auth.userId.toLowerCase();
    } else {
      TwitchUserID = makeid(5)
    }

    new AllertController(StreamerID);
    var ControllerOfStoreDisplay = new StoreDisplayController(StreamerID, TwitchUserID);

    var UserMiner = new Miner(StreamerID, TwitchUserID);
    UserMiner.onMine = (CurrentCoinsOfUserNunber, BalanceChange) => {
      ControllerOfStoreDisplay.setViewBalance(CurrentCoinsOfUserNunber, BalanceChange)
    };
    UserMiner.startMining();

  });
})
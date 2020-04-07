import io = require('socket.io-client');

import PollController from "./PollController";
import { HOST, getLocaleFile } from "../../BackendConnection";
import SettingsController from "./SettingsController";
import StoreController from "./StoreController";
import PurchaseOrderController from "./PurchaseOrderController";
import WalletsController from "./WalletsController";
import IOListeners from "../../../services/IOListeners";
import { ViewMain } from "../view/ViewMain";
import { IncertTextInHardCode, LocalizedTexts } from '../../common/model/IncertText';

export const STREAMER_SOCKET = io(HOST);
export var Texts: LocalizedTexts;

var token, StreamerID;

export function NotifyViewers(TwitchListener: { ListenerName: string, data: any }) {
  window.Twitch.ext.send("broadcast", "json", JSON.stringify(TwitchListener));
}


window.Twitch.ext.onContext(async (context) => {
  console.error(context);

  new ViewMain();

  IncertTextInHardCode(await getLocaleFile('view_config_hard_code', context.language));

  if (!Texts) Texts = new LocalizedTexts(await getLocaleFile('view_config', context.language));
  else Texts.update(await getLocaleFile('view_config', context.language));

})

window.Twitch.ext.onAuthorized(async (auth) => {
  token = auth.token;
  StreamerID = auth.channelId.toLowerCase();
  STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, StreamerID);

  STREAMER_SOCKET.on('connect', () => {
    STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, StreamerID);
  })

  let Registered = false;
  STREAMER_SOCKET.on(IOListeners.onStreamerAsRegistered, async () => {

    if (Registered) return;
    else Registered = true;

    new PollController(auth.token, StreamerID);

    new SettingsController(auth.token, StreamerID);

    new StoreController(auth.token, StreamerID);

    new PurchaseOrderController(auth.token, StreamerID, STREAMER_SOCKET);

    new WalletsController(auth.token, StreamerID);
  })
});


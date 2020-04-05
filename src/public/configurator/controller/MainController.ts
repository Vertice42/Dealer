import io = require('socket.io-client');

import PollController from "./PollController";
import { HOST, getLocaleFile as getLocalizedTextsFile } from "../../BackendConnection";
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

  IncertTextInHardCode(await getLocalizedTextsFile('view_config_hard_code', context.language));

  if (!Texts) Texts = new LocalizedTexts(await getLocalizedTextsFile('view_config', context.language));
  else Texts.update(await getLocalizedTextsFile('view_config', context.language));

})

window.Twitch.ext.onAuthorized(async (auth) => {
  token = auth.token;
  StreamerID = auth.channelId.toLowerCase();
  STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, StreamerID);

  STREAMER_SOCKET.on('connect', () => {
    STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, StreamerID);
  })

  let Registered = false;
  STREAMER_SOCKET.on(IOListeners.onStreamerAsRegistered, () => {

    if (Registered) return;
    else Registered = true;

    new PollController(StreamerID);

    new SettingsController(StreamerID);

    new StoreController(StreamerID);

    new PurchaseOrderController(StreamerID, STREAMER_SOCKET);

    new WalletsController(StreamerID);
  })
});


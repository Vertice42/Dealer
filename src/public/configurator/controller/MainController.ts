import BackendConnections = require("../../BackendConnection");
import io = require('socket.io-client');

import { Poll } from "../../../services/models/poll/Poll";
import PollController from "./PollController";
import { HOST } from "../../BackendConnection";
import SettingsController from "./SettingsController";
import StoreController from "./StoreController";
import PurchaseOrderController from "./PurchaseOrderController";
import WalletsController from "./WalletsController";
import IOListeners from "../../../services/IOListeners";

export const STREAMER_SOCKET = io(HOST);

var token, StreamerID;

export function NotifyViewers(TwitchListener: { ListenerName: string, data: any }) {
  window.Twitch.ext.send("broadcast", "json", JSON.stringify(TwitchListener));
}

window.Twitch.ext.onContext((context) => {
  console.log(context);
})

window.Twitch.ext.onAuthorized(async (auth) => {
  token = auth.token;
  StreamerID = auth.channelId.toLowerCase();

  STREAMER_SOCKET.on('connect',()=> {
    STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, StreamerID);
  })

  let Registered = false;
  STREAMER_SOCKET.on(IOListeners.onStreamerAsRegistered, () => {
    if(Registered) return;
    else Registered = true

    new PollController(StreamerID);

    new SettingsController(StreamerID);

    new StoreController(StreamerID);

    new PurchaseOrderController(StreamerID, STREAMER_SOCKET);

    new WalletsController(StreamerID);
  })
});


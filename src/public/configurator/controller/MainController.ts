import BackendConnections = require("../../BackendConnection");
import io = require('socket.io-client');

import { Poll } from "../../../services/models/poll/Poll";
import PollController from "./PollController";
import { host } from "../../BackendConnection";
import SettingsController from "./SettingsController";
import StoreController from "./StoreController";
import PurchaseOrderController from "./PurchaseOrderController";
import WalletsController from "./WalletsController";

const socket = io(host);

const twitch: TwitchExt = window.Twitch.ext;
var token, StreamerID;

export class StatusObservation {

    private observe(onObserver: (arg0: Poll) => boolean) {
        BackendConnections.getCurrentPoll(StreamerID)
            .then((Poll: Poll) => {
                if (!onObserver(Poll))
                    setTimeout(() => {
                        this.observe(onObserver);
                    }, 150);
            })
    }

    constructor(onObserver: (arg0: Poll) => boolean) {
        this.observe(onObserver);
    }
}//TODO REMOVE THIS SUBISTITUIR POR SOKET IO

export function NotifyViewers(TwitchListener:{ListenerName:string,data:any}){
    window.Twitch.ext.send("broadcast", "json", JSON.stringify(TwitchListener));
  }

twitch.onContext((context) => {
    console.log(context);
})


twitch.onAuthorized(async (auth) => {
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();

    socket.emit('registered', StreamerID);

    new PollController(StreamerID);

    new SettingsController(StreamerID);

    new StoreController(StreamerID);

    new PurchaseOrderController(StreamerID, socket);

    new WalletsController(StreamerID)

});


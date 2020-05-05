import io = require('socket.io-client');
import PollController from "./PollController";
import SettingsController from "./SettingsController";
import StoreController from "./StoreController";
import PurchaseOrderController from "./PurchaseOrderController";
import WalletsController from "./WalletsController";
import IOListeners from "../../../services/models/listeners/IOListeners";
import { ViewMain } from "../view/ViewMain";
import { InsertTextInHardCode, LocalizedTexts } from '../../common/view/Texts';
import { TwitchListener } from '../../common/model/TwitchListener';
import { getLocaleFile } from '../../common/BackendConnection/BlobFiles';
import { ViewAdvertisement } from '../view/ViewAdvertising';
import { updateTransitionsByUser as updateTransactionOfUser } from '../../common/BackendConnection/ExtensionProducts';
import { UpdateTransitionsByUserRequest as UpdateTransactionOfUserRequest } from '../../../services/models/dealer/UpdateProductsPurchasedByUserRequest';
import config from '../../common/BackendConnection/config';

export const STREAMER_SOCKET = io(config.URL);
export var Texts: LocalizedTexts;

var Initialized = false;

/**
 * Notify by Twitch broadcast to all channel viewers
 * @param TwitchListener : Listener pre-defined to be able to be identified the notification can contain a json object
 */
export function NotifyViewers(TwitchListener: TwitchListener) {
  window.Twitch.ext.send("broadcast", "json", JSON.stringify(TwitchListener));
}

window.Twitch.ext.onContext(async (context) => {

  InsertTextInHardCode(await getLocaleFile('view_config_hard_code', context.language));

  if (!Texts) Texts = new LocalizedTexts(await getLocaleFile('view_config', context.language));
  else Texts.update(await getLocaleFile('view_config', context.language));

  window.Twitch.ext.onAuthorized(async (auth) => {
    STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, auth.channelId);

    STREAMER_SOCKET.on('connect', () => {
      STREAMER_SOCKET.emit(IOListeners.RegisterStreamer, auth.channelId);
    })

    STREAMER_SOCKET.on(IOListeners.onStreamerAsRegistered, async () => {
      if (Initialized) return; else Initialized = true;
      new ViewMain();

      if (process.env.NODE_ENV !== 'production') {
        window.Twitch.ext.bits.setUseLoopback(true);
      }

      ViewAdvertisement.onAdvertisementButtonActive = () => {
        window.Twitch.ext.bits.onTransactionComplete(async (Transaction) => {
          await updateTransactionOfUser(new UpdateTransactionOfUserRequest(auth.token, Transaction));
          ViewAdvertisement.Hide();
        })
        window.Twitch.ext.bits.useBits('Premium');

        window.Twitch.ext.bits.onTransactionCancelled(() => {
          ViewAdvertisement.Hide();
        })
      }

      new PollController(auth.token, auth.channelId);

      new SettingsController(auth.token, auth.channelId);

      new StoreController(auth.token, auth.channelId);

      new PurchaseOrderController(auth.token, auth.channelId, STREAMER_SOCKET);

      new WalletsController(auth.token, auth.channelId);
    })
  });
});
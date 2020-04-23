import StoreItem, { getItemsSetting } from "../../../services/models/store/StoreItem";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import ViewPurchaseOrders from "../view/ViewPurchaseOrders";
import IO_Listeners from "../../../services/IOListeners";
import { NotifyViewers } from "./MainController";
import TwitchListeners from "../../../services/TwitchListeners";
import FolderTypes from "../../../services/models/files_manager/FolderTypes";
import { PurchaseOrderItem } from "../model/PurchaseOrderItem";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";
import { GetStore } from "../../common/BackendConnection/Store";
import { getUrlOfFile } from "../../common/BackendConnection/BlobFiles";
import { DeletePurchaseOrder, GetPurchaseOrders } from "../../common/BackendConnection/PurchaseOrders";

/**
 * Connects the streamer actions and controls consumption of purchase orders for items made by users
 */
export default class PurchaseOrderController {
    private Token: string;
    private StreamerID: string;
    private Socket: SocketIOClient.Socket;
    private ViewPurchaseOrders = new ViewPurchaseOrders;
    private PurchaseOrdersList: PurchaseOrderItem[] = [];
    private AudioPlayerIsUnlocked = true;

    private ExecuteOrder(PurchaseOrderItemList: PurchaseOrderItem) {

        this.ViewPurchaseOrders.HTML_AudioPlayer.src = getUrlOfFile(this.StreamerID, FolderTypes.StoreItem + PurchaseOrderItemList.StoreItem.id, PurchaseOrderItemList.StoreItem.FileName);
        this.ViewPurchaseOrders.HTML_AudioPlayer.volume = getItemsSetting('AudioVolume',PurchaseOrderItemList.StoreItem.ItemsSettings).value / 100;

        this.ViewPurchaseOrders.HTML_AudioPlayer.onplay = () => {
            this.ViewPurchaseOrders.removeViewPurchaseOrder(PurchaseOrderItemList.ViewPurchasedItem);
            this.ViewPurchaseOrders.setRunningOrder(PurchaseOrderItemList.PurchaseOrder.TwitchUserID, PurchaseOrderItemList.StoreItem.Description);

            this.ViewPurchaseOrders.EnableAudioPlayerButtons();
            this.ViewPurchaseOrders.setStarted();
            this.ViewPurchaseOrders.HTML_AudioPlayer.onplay = null;
        }

        this.ViewPurchaseOrders.HTML_PauseAudioPlayerButton.onclick = () => {
            window.navigator.vibrate(50);

            if (this.ViewPurchaseOrders.IsStarted()) {
                this.ViewPurchaseOrders.setInPause();
                this.ViewPurchaseOrders.HTML_AudioPlayer.pause();
            } else {
                this.ViewPurchaseOrders.setStarted();
                this.ViewPurchaseOrders.HTML_AudioPlayer.play();
            }
        }

        this.ViewPurchaseOrders.HTML_RefundCurrentAudioButton.onclick = async () => {
            this.ViewPurchaseOrders.HTML_AudioPlayer.pause();
            this.nextOrder(true);
        }

        this.ViewPurchaseOrders.HTML_AudioPlayer.play().catch(() => {
            this.AudioPlayerIsUnlocked = false;
            this.ViewPurchaseOrders.setPlaybackUnavailableMode(true);

            let onBodyClick = () => {
                this.ViewPurchaseOrders.HTML_AudioPlayer.play();
                document.body.removeEventListener('click', onBodyClick);
                this.ViewPurchaseOrders.setPlaybackUnavailableMode(false);
                this.AudioPlayerIsUnlocked = true;
            }
            document.body.addEventListener('click', onBodyClick)
        })

        this.ViewPurchaseOrders.HTML_AudioPlayer.ontimeupdate = (event) => {
            this.ViewPurchaseOrders.setAudioPlayerProgress(
                this.ViewPurchaseOrders.HTML_AudioPlayer.currentTime / this.ViewPurchaseOrders.HTML_AudioPlayer.duration * 100)
        }

        this.ViewPurchaseOrders.HTML_AudioPlayer.onended = () => this.nextOrder(false);
    }
    private nextOrder(Refund: boolean) {
        let DeletedPurchaseOrder = this.PurchaseOrdersList.shift().PurchaseOrder;
        DeletePurchaseOrder(this.Token, DeletedPurchaseOrder, Refund);

        if (this.PurchaseOrdersList[0]) this.ExecuteOrder(this.PurchaseOrdersList[0])
        else this.ViewPurchaseOrders.setInPurchaseOrdersEmpty();

        NotifyViewers({ ListenerName: TwitchListeners.onDeletePurchaseOrder, data: DeletedPurchaseOrder });
    }

    private async setListener() {
        this.ViewPurchaseOrders.onButtonPurchaseOrderRefundActive = async (ViewPurchasedItem, PurchaseOrder) => {
            if (!this.AudioPlayerIsUnlocked) return;
            this.ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
            this.PurchaseOrdersList.splice(ViewPurchasedItem.id, 1);
            await DeletePurchaseOrder(this.Token, PurchaseOrder, true);
            NotifyViewers({ ListenerName: TwitchListeners.onDeletePurchaseOrder, data: PurchaseOrder });
        }
    }
    private async loadingPurchaseOrders() {
        this.ViewPurchaseOrders.onAddPurchaseOrder = (PurchaseOrderItem: PurchaseOrderItem) => {
            this.PurchaseOrdersList.push(PurchaseOrderItem);
            if (this.PurchaseOrdersList.length === 1) this.ExecuteOrder(PurchaseOrderItem)
        }

        let PurchaseOrders = await GetPurchaseOrders(this.StreamerID);
        PurchaseOrders.forEach(async (PurchaseOrder: PurchaseOrder) => {
            let StoreItem = await GetStore(this.StreamerID, PurchaseOrder.StoreItemID)
            if (StoreItem) {
                this.ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, StoreItem);
            } else {
                DeletePurchaseOrder(this.Token, PurchaseOrder, true);
            }
        })

        this.Socket.on(IO_Listeners.onAddPurchasedItem, async (PurchaseOrder: PurchaseOrder) => {
            let StoreItem: StoreItem = await GetStore(this.StreamerID, PurchaseOrder.StoreItemID)
            this.ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, StoreItem);
            let ItemsSetting: ItemSetting = getItemsSetting('SingleReproduction',StoreItem.ItemsSettings);
            if (ItemsSetting.Enable) {
                NotifyViewers({ ListenerName: TwitchListeners.onAddPurchasedItem, data: PurchaseOrder })
            }
        });

        this.setListener();
    }

    constructor(Token: string, StreamerID: string, socket: SocketIOClient.Socket) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.Socket = socket;
        this.loadingPurchaseOrders();
    }
}
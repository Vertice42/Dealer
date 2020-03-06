import BackendConnections = require("../../BackendConnection");
import StoreItem from "../../../services/models/store/StoreItem";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import ViewPurchaseOrders, { ViewPurchasedItem } from "../view/ViewPurchaseOrders";
import IO_Listeners from "../../../services/IOListeners";
import { NotifyViewers } from "./MainController";
import TwitchListeners from "../../../services/TwitchListeners";

export class PurchaseOrderItem {
    ViewPurchasedItem: ViewPurchasedItem;
    PurchaseOrder: PurchaseOrder;
    StoreItem: StoreItem;
    constructor(ViewPurchasedItem: ViewPurchasedItem, PurchaseOrder: PurchaseOrder, StoreItem: StoreItem) {
        this.ViewPurchasedItem = ViewPurchasedItem;
        this.PurchaseOrder = PurchaseOrder;
        this.StoreItem = StoreItem;
    }
}

export default class PurchaseOrderController {
    StreamerID: string;
    socket: SocketIOClient.Socket;
    ViewPurchaseOrders = new ViewPurchaseOrders;
    PurchaseOrdersList: PurchaseOrderItem[] = [];

    ExecuteOrder(PurchaseOrderItemList: PurchaseOrderItem) {

        this.ViewPurchaseOrders.HTML_AudioPlayer.src = BackendConnections.getUrlOfFile(this.StreamerID,'Store Item '+PurchaseOrderItemList.StoreItem.id, PurchaseOrderItemList.StoreItem.FileName);

        this.ViewPurchaseOrders.HTML_AudioPlayer.onplay = () => {
            this.ViewPurchaseOrders.removeViewPurchaseOrder(PurchaseOrderItemList.ViewPurchasedItem);
            this.ViewPurchaseOrders.setRunningOrder(PurchaseOrderItemList.PurchaseOrder.TwitchUserID, PurchaseOrderItemList.StoreItem.Description);

            this.ViewPurchaseOrders.EnableAudioPlayerButtons();
            this.ViewPurchaseOrders.setStarted();
            this.ViewPurchaseOrders.HTML_AudioPlayer.onplay = null;
        }

        this.ViewPurchaseOrders.HTML_PauseAudioPlayerButton.onclick = () => {

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
            let onBodyClick = () => {
                this.ViewPurchaseOrders.HTML_AudioPlayer.play()
                document.body.removeEventListener('click', onBodyClick)
            }
            document.body.addEventListener('click', onBodyClick)
        })

        this.ViewPurchaseOrders.HTML_AudioPlayer.ontimeupdate = (event) => {
            this.ViewPurchaseOrders.setAudioPlayerProgress(
                this.ViewPurchaseOrders.HTML_AudioPlayer.currentTime / this.ViewPurchaseOrders.HTML_AudioPlayer.duration * 100)
        }

        this.ViewPurchaseOrders.HTML_AudioPlayer.onended = () => this.nextOrder(false);
    }
    nextOrder(Refund: boolean) {
        if (PurchaseOrder) {
            let DeletedPurchaseOrder = this.PurchaseOrdersList.shift().PurchaseOrder;
            BackendConnections.DeletePurchaseOrder(this.StreamerID, DeletedPurchaseOrder, Refund);

            if (this.PurchaseOrdersList[0]) this.ExecuteOrder(this.PurchaseOrdersList[0])
            else this.ViewPurchaseOrders.setInPurchaseOrdersEmpty();

            NotifyViewers({ ListenerName: TwitchListeners.onDeletePurchaseOrder, data: DeletedPurchaseOrder });

        }
    }
    async EnbleAllCommands() {
        this.ViewPurchaseOrders.onButtonPurchaseOrderRefundActive = async (ViewPurchasedItem, PurchaseOrder) => {
            this.ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
            this.PurchaseOrdersList.splice(ViewPurchasedItem.id, 1);
            await BackendConnections.DeletePurchaseOrder(this.StreamerID, PurchaseOrder, true);
            NotifyViewers({ ListenerName: TwitchListeners.onDeletePurchaseOrder, data: PurchaseOrder });
        }
    }

    async loadingPurchaseOrders() {
        this.ViewPurchaseOrders.onAddPuchaseOrder = (PurchaseOrderItem: PurchaseOrderItem) => {
            this.PurchaseOrdersList.push(PurchaseOrderItem);
            if (this.PurchaseOrdersList.length === 1) this.ExecuteOrder(PurchaseOrderItem)
        }

        let PurchaseOrders = await BackendConnections.GetPurchaseOrders(this.StreamerID);
        PurchaseOrders.forEach(async (PurchaseOrder: PurchaseOrder) => {
            let StoreItem = await BackendConnections.GetStore(this.StreamerID, PurchaseOrder.StoreItemID)
            if (StoreItem) {
                this.ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, StoreItem);
            } else {
                BackendConnections.DeletePurchaseOrder(this.StreamerID,PurchaseOrder,true);
            }
        })

        this.socket.on(IO_Listeners.onAddPurchasedItem, async (PurchaseOrder: PurchaseOrder) => {
            this.ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, await BackendConnections.GetStore(this.StreamerID, PurchaseOrder.StoreItemID));
            NotifyViewers({ ListenerName: TwitchListeners.onAddPurchasedItem, data: PurchaseOrder })
        });

        this.EnbleAllCommands();
    }
    constructor(StreamerID: string, socket: SocketIOClient.Socket) {
        this.StreamerID = StreamerID;
        this.socket = socket;
        this.loadingPurchaseOrders();
    }
}
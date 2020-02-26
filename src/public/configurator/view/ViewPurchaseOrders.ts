import StoreItem from "../../../services/models/store/StoreItem";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import { PurchaseOrderItem } from "../controller/PurchaseOrderController";

export class ViewPurchasedItem {
    private ID: number
    HTML: HTMLDivElement
    private HTML_ItemPlacement: HTMLSpanElement
    private HTML_UserName: HTMLSpanElement
    private HTML_PurchaseTime: HTMLSpanElement
    private HTML_ItemName: HTMLSpanElement
    private HTML_RefundButton: HTMLSpanElement

    onRefundButtonActive = () => { }

    private CreateHTML_ItemPlacement(ItemPlacement: number) {
        this.HTML_ItemPlacement = document.createElement('span');
        this.HTML_ItemPlacement.classList.add('ItemPlacement');
        this.HTML_ItemPlacement.innerText = ItemPlacement + '°';
        return this.HTML_ItemPlacement;
    }

    private CreateHTML_UserName(UserName: string) {
        this.HTML_UserName = document.createElement('span');
        this.HTML_UserName.classList.add('UserName');
        this.HTML_UserName.innerText = '@' + UserName;
        return this.HTML_UserName;
    }

    private CreatePurchaseTime(PurchaseTime: number) {
        this.HTML_PurchaseTime = document.createElement('span');
        this.HTML_PurchaseTime.classList.add('PurchaseTime');
        //add ,ecanica de tempo dinamico
        this.HTML_PurchaseTime.innerText = PurchaseTime + '';
        return this.HTML_PurchaseTime;
    }

    private CreateHTML_ItemName(ItemName: string) {
        this.HTML_ItemName = document.createElement('span');
        this.HTML_ItemName.classList.add('ItemName');
        this.HTML_ItemName.innerText = ItemName;
        return this.HTML_ItemName;
    }

    private CreateHTML_RefundButton() {
        this.HTML_RefundButton = document.createElement('button');
        this.HTML_RefundButton.classList.add('RefundButton');
        this.HTML_RefundButton.innerText = 'Refund';
        this.HTML_RefundButton.onclick = () => {
            this.onRefundButtonActive();
        }
        return this.HTML_RefundButton;
    }

    public get id(): number {
        return this.ID;
    }

    public set id(id: number) {
        this.ID = id;
        this.HTML_ItemPlacement.innerText = (id + 1) + '°';
    }

    constructor(id: number, UserName: string, PurchaseTime: number, ItemDescription: string) {
        this.ID = id;
        this.HTML = document.createElement('div');
        this.HTML.classList.add('PurchasedItem');
        this.HTML.appendChild(this.CreateHTML_ItemPlacement(id + 1))
        this.HTML.appendChild(this.CreateHTML_UserName(UserName))
        this.HTML.appendChild(this.CreatePurchaseTime(PurchaseTime))
        this.HTML.appendChild(this.CreateHTML_ItemName(ItemDescription))
        this.HTML.appendChild(this.CreateHTML_RefundButton())
    }
}

export default class ViewPurchaseOrders {
    ViewPurchaseOrdersArray: ViewPurchasedItem[] = [];
    private HTML_ReproducingMedia = <HTMLDivElement>document.getElementById('ReproducingMedia');
    private HTML_PlaybackUserName = <HTMLSpanElement>document.getElementById('PlaybackUserName');
    private HTML_PlaybackItemName = <HTMLSpanElement>document.getElementById('PlaybackItemName');
    HTML_PauseAudioPlayerButton = <HTMLDivElement>document.getElementById('PauseAudioPlayerButton');
    HTML_RefundCurrentAudioButton = <HTMLButtonElement>document.getElementById('RefundCurrentAudioButton');
    HTML_ListOfPurchasedItems = <HTMLDivElement>document.getElementById('ListOfPurchasedItems');
    HTML_LoadingBarOfAudioPlayer = <HTMLDivElement>document.getElementById('LoadingBarOfAudioPlayer');
    HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');
    IsStarted() {
        return this.HTML_PauseAudioPlayerButton.classList.contains('Started');
    }
    EnableAudioPlayerButtons() {
        this.HTML_PauseAudioPlayerButton.classList.remove('Disable');
        this.HTML_RefundCurrentAudioButton.classList.remove('Disable');
    }
    DisableAudioPlayerButtons() {
        this.HTML_PauseAudioPlayerButton.classList.add('Disable');
        this.HTML_RefundCurrentAudioButton.classList.add('Disable');
    }
    setStarted() {
        this.HTML_ReproducingMedia.classList.remove('PurchaseOrdersEmpty');
        this.HTML_ReproducingMedia.classList.add('PurchaseOrdersNotEmpty');
        this.HTML_PauseAudioPlayerButton.classList.remove('InPause');
        this.HTML_PauseAudioPlayerButton.classList.add('Started');
    }
    setInPause() {
        this.HTML_PauseAudioPlayerButton.classList.remove('Started');
        this.HTML_PauseAudioPlayerButton.classList.add('InPause');
    }
    setInPurchaseOrdersEmpty() {
        this.HTML_ReproducingMedia.classList.remove('PurchaseOrdersNotEmpty');
        this.HTML_ReproducingMedia.classList.add('PurchaseOrdersEmpty');
    }
    onButtonPurchaseOrderRefundActive = (ViewPurchasedItem: ViewPurchasedItem, PurchaseOrder: PurchaseOrder) => { };
    onAddPuchaseOrder = (PurchaseOrderItem: PurchaseOrderItem) => { };
    setAudioPlayerProgress(progres: number) {
        let left = progres;
        let rigth = progres;
        this.HTML_LoadingBarOfAudioPlayer.style.backgroundImage =
            `linear-gradient(to left, rgb(86, 128, 219) ${rigth}%, rgb(93, 144, 255) ${left}%)`;
    }
    setRunningOrder(TwitchUserName: string, StoreItemName: string) {
        this.HTML_PlaybackUserName.innerText = TwitchUserName;
        this.HTML_PlaybackItemName.innerText = StoreItemName;
    }
    addViewPurchaseOrder(PurchaseOrder: PurchaseOrder, StoreItem: StoreItem) {
        let viewPurchasedItem = new ViewPurchasedItem(this.ViewPurchaseOrdersArray.length, PurchaseOrder.TwitchUserID, new Date(PurchaseOrder.updatedAt).getTime(), StoreItem.Description);
        this.ViewPurchaseOrdersArray.push(viewPurchasedItem);
        viewPurchasedItem.onRefundButtonActive = () => {
            this.onButtonPurchaseOrderRefundActive(viewPurchasedItem, PurchaseOrder);
        };
        this.onAddPuchaseOrder(new PurchaseOrderItem(viewPurchasedItem, PurchaseOrder, StoreItem));
        this.HTML_ListOfPurchasedItems.appendChild(viewPurchasedItem.HTML);
    }
    removeViewPurchaseOrder(ViewPurchasedItem: ViewPurchasedItem) {
        this.HTML_ListOfPurchasedItems.removeChild(ViewPurchasedItem.HTML);
        this.ViewPurchaseOrdersArray.splice(ViewPurchasedItem.id, 1);
        this.ViewPurchaseOrdersArray.forEach((viewPurchasedItem, index) => {
            viewPurchasedItem.id = index;
        });
    }
    constructor() {
    }
}

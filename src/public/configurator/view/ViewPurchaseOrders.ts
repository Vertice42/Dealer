import StoreItem from "../../../services/models/store/StoreItem";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import { PurchaseOrderItem } from "../model/PurchaseOrderItem";
import { CrateLinerAnimation } from "../../common/view/ViewerFeatures";
import { Texts } from "../controller/MainController";

class ViewPurchaseTime {
    HTML: HTMLSpanElement;
    PurchaseTime: number;

    updateTime() {
        let time = new Date().getTime() - this.PurchaseTime;

        time = time / 1000;
        if (time < 60) {
            let TimeRound = Math.round(time);
            Texts.onLocaleChange = () => {
                this.HTML.innerText = `${TimeRound} ${Texts.getText('Second')}${(TimeRound > 1) ? 's' : ''}`;
            };
            return this.HTML.innerText;
        }
        time = time / 60;
        if (time < 60) {
            let TimeRound = Math.round(time);
            Texts.onLocaleChange = () => {
                this.HTML.innerText = `${TimeRound} ${Texts.getText('Minute')}${(TimeRound > 1) ? 's' : ''}`;
            };
            return this.HTML.innerText
        }
        time = time / 60;
        if (time < 60) {
            let TimeRound = Math.round(time);
            Texts.onLocaleChange = () => {
                this.HTML.innerText = `${TimeRound} ${Texts.getText('Hour')}${(TimeRound > 1) ? 's' : ''}`;
            }
            return this.HTML.innerText
        }

        let TimeRound = Math.round(time);
        Texts.onLocaleChange = () => {
            this.HTML.innerText = `${TimeRound} ${Texts.getText('Days')}`;
        }
        return this.HTML.innerText
    }

    constructor(PurchaseTime: number) {
        this.PurchaseTime = PurchaseTime;

        this.HTML = document.createElement('span');
        this.HTML.classList.add('PurchaseTime');
        this.updateTime();
    }
}

/**
 * It is a viewer for the streamer to be able to view purchased items
 */
export class ViewPurchasedItem {
    private ID: number
    HTML: HTMLDivElement
    private HTML_ItemPlacement: HTMLSpanElement
    private HTML_UserName: HTMLSpanElement
    private HTML_ItemName: HTMLSpanElement
    private HTML_RefundButton: HTMLSpanElement

    onRefundButtonActive = () => { }
    ViewPurchaseTime: ViewPurchaseTime;

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

    private CreateHTML_ItemName(ItemName: string) {
        this.HTML_ItemName = document.createElement('span');
        this.HTML_ItemName.classList.add('ItemName');
        this.HTML_ItemName.innerText = ItemName;
        return this.HTML_ItemName;
    }

    private CreateHTML_RefundButton() {
        this.HTML_RefundButton = document.createElement('button');
        this.HTML_RefundButton.classList.add('RefundButton');
        Texts.onLocaleChange = () => {
            this.HTML_RefundButton.innerText = Texts.getText('Refund');
        }
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

        this.ViewPurchaseTime = new ViewPurchaseTime(PurchaseTime);

        this.HTML.appendChild(this.CreateHTML_ItemPlacement(id + 1))
        this.HTML.appendChild(this.CreateHTML_UserName(UserName))
        this.HTML.appendChild(this.ViewPurchaseTime.HTML);
        this.HTML.appendChild(this.CreateHTML_ItemName(ItemDescription))
        this.HTML.appendChild(this.CreateHTML_RefundButton())
    }
}

/**
 * Contains methods for show purchase orders and listeners to capture user actions
 */
export default class ViewPurchaseOrders {
    ResizeObserver: ResizeObserver;
    ViewPurchaseOrdersArray: ViewPurchasedItem[] = [];

    AudioProgress: number;

    HTML_PurchaseOrdersDiv = <HTMLDivElement>document.getElementById('PurchaseOrdersDiv');
    HTML_ReproducingMedia = <HTMLDivElement>document.getElementById('ReproducingMedia');
    HTML_PlaybackUserName = <HTMLSpanElement>document.getElementById('PlaybackUserName');
    HTML_PlaybackItemName = <HTMLSpanElement>document.getElementById('PlaybackItemName');
    HTML_PauseAudioPlayerButton = <HTMLDivElement>document.getElementById('PauseAudioPlayerButton');
    HTML_RefundCurrentAudioButton = <HTMLButtonElement>document.getElementById('RefundCurrentAudioButton');
    HTML_ListOfPurchasedItems = <HTMLDivElement>document.getElementById('ListOfPurchasedItems');
    HTML_LoadingBarOfAudioPlayer = <HTMLDivElement>document.getElementById('LoadingBarOfAudioPlayer');
    HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');
    HTML_PlaybackUnavailableAlert: HTMLDivElement;

    onButtonPurchaseOrderRefundActive = (ViewPurchasedItem: ViewPurchasedItem, PurchaseOrder: PurchaseOrder) => { };
    onAddPurchaseOrder = (PurchaseOrderItem: PurchaseOrderItem) => { };

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

    setAudioPlayerProgress(newProgress: number) {
        CrateLinerAnimation(this.AudioProgress, newProgress, 200, (newProgress) => {
            let left = newProgress;
            let right = newProgress;
            this.HTML_LoadingBarOfAudioPlayer.style.backgroundImage =
                `linear-gradient(to left, rgb(80, 40, 134) ${right}%, rgb(116, 30, 251) ${left}%,rgb(87, 47, 148) 90%)`;
        })

        this.AudioProgress = newProgress;
    }
    setRunningOrder(TwitchUserName: string, StoreItemName: string) {
        this.HTML_PlaybackUserName.innerText = TwitchUserName;
        this.HTML_PlaybackItemName.innerText = StoreItemName;
    }
    setPlaybackUnavailableMode(key: boolean) {
        if (key) {
            this.HTML_PlaybackUnavailableAlert = document.createElement('div');
            this.HTML_PlaybackUnavailableAlert.classList.add('PlaybackUnavailableAlert');

            this.HTML_PlaybackUnavailableAlert.style.width = this.HTML_PurchaseOrdersDiv.clientWidth + 'px';
            this.HTML_PlaybackUnavailableAlert.style.height = this.HTML_PurchaseOrdersDiv.clientHeight + 'px';

            this.ResizeObserver = new ResizeObserver(() => {

                this.HTML_PlaybackUnavailableAlert.style.width = this.HTML_PurchaseOrdersDiv.clientWidth + 'px';
                this.HTML_PlaybackUnavailableAlert.style.height = this.HTML_PurchaseOrdersDiv.clientHeight + 'px';

            });

            this.ResizeObserver.observe(this.HTML_PurchaseOrdersDiv);

            this.HTML_PurchaseOrdersDiv.insertBefore(this.HTML_PlaybackUnavailableAlert, this.HTML_ReproducingMedia);

        } else {
            this.ResizeObserver.unobserve(this.HTML_PurchaseOrdersDiv);
            this.ResizeObserver.disconnect();
            this.HTML_PurchaseOrdersDiv.removeChild(this.HTML_PlaybackUnavailableAlert);
        }
    }

    addViewPurchaseOrder(PurchaseOrder: PurchaseOrder, StoreItem: StoreItem) {
        let viewPurchasedItem = new ViewPurchasedItem(this.ViewPurchaseOrdersArray.length, PurchaseOrder.TwitchUserID, new Date(PurchaseOrder.updatedAt).getTime(), StoreItem.Description);
        this.ViewPurchaseOrdersArray.push(viewPurchasedItem);
        viewPurchasedItem.onRefundButtonActive = () => {
            this.onButtonPurchaseOrderRefundActive(viewPurchasedItem, PurchaseOrder);
        };
        this.onAddPurchaseOrder(new PurchaseOrderItem(viewPurchasedItem, PurchaseOrder, StoreItem));
        this.HTML_ListOfPurchasedItems.appendChild(viewPurchasedItem.HTML);
    }
    removeViewPurchaseOrder(ViewPurchasedItem: ViewPurchasedItem) {
        this.HTML_ListOfPurchasedItems.removeChild(ViewPurchasedItem.HTML);
        this.ViewPurchaseOrdersArray.splice(ViewPurchasedItem.id, 1);
        this.ViewPurchaseOrdersArray.forEach((viewPurchasedItem, index) => {
            viewPurchasedItem.id = index;
        });
    }

    private updateViewPurchaseOrdersTime() {
        setTimeout(() => {
            this.ViewPurchaseOrdersArray.forEach(ViewPurchaseOrder => {
                ViewPurchaseOrder.ViewPurchaseTime.updateTime();
            })
            this.updateViewPurchaseOrdersTime();
        }, (this.ViewPurchaseOrdersArray.length > 1) ? 1000 : 10000);
    }
    
    constructor() {
        this.updateViewPurchaseOrdersTime();
    }
}

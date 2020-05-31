import { sleep } from "../../../services/utils/functions";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import StoreItem, { getItemsSetting } from "../../../services/models/store/StoreItem";
import { DivRelocatable, AutomaticHidingDueInactivity } from "../../common/view/ViewerFeatures";
import { WalletSkin } from "../../../services/models/wallet/WalletSkin";
import { Texts } from "../controller/MainController";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";

class ViewStoreItemDisplay {
    HTML: HTMLDivElement
    HTML_TypeDisplay: HTMLImageElement;
    HTML_Description: HTMLSpanElement;
    HTML_Price: HTMLSpanElement;
    HTML_BuyButton: HTMLButtonElement;

    private createTypeDisplay() {
        this.HTML_TypeDisplay = document.createElement('img');
        this.HTML_TypeDisplay.src = 'video_overlay/images/sound-document.png';
        return this.HTML_TypeDisplay;
    }

    private createDescription(Description: string) {
        this.HTML_Description = document.createElement('span');
        this.HTML_Description.classList.add('Description');
        this.HTML_Description.innerText = Description;
        return this.HTML_Description;
    }

    private createPrice(Price: number, CoinChar: string) {
        this.HTML_Price = document.createElement('span');
        this.HTML_Price.classList.add('Price');
        this.HTML_Price.innerText = Price + ' ' + CoinChar.toUpperCase();
        return this.HTML_Price;
    }

    private createBuyButton() {
        this.HTML_BuyButton = document.createElement('button');
        Texts.onLocaleChange = () => {
            this.HTML_BuyButton.innerText = Texts.get('Buy');
        }
        return this.HTML_BuyButton;
    }

    setUnavailable() {
        this.HTML.classList.remove('StoreItemAvailable');
        this.HTML.classList.add('StoreItemUnavailable');

    }

    setAvailable() {
        this.HTML.classList.remove('StoreItemUnavailable');
        this.HTML.classList.add('StoreItemAvailable');

    }

    constructor(Description: string, Price: number, CoinChar: string) {
        this.HTML = <HTMLDivElement>document.createElement('div');
        this.HTML.classList.add('StoreItem');

        this.HTML.appendChild(this.createTypeDisplay())
        this.HTML.appendChild(this.createDescription(Description))
        this.HTML.appendChild(this.createPrice(Price, CoinChar))
        this.HTML.appendChild(this.createBuyButton())
    }
}

export class ViewWalletSkin {
    HTML: HTMLDivElement;
    HTML_WalletSkinImg: HTMLImageElement;
    HTML_WalletSkinPrice: HTMLSpanElement;
    WalletSkin: WalletSkin;
    private price = 0;

    set Price(price: number) {
        this.price = price
        this.HTML_WalletSkinPrice.innerText = this.price + ' bits';
    }

    get Price() {
        return this.price;
    }

    get IsLock(): boolean {
        return this.HTML.classList.contains('WalletSkinLock');
    }

    setSelected() {
        this.HTML.classList.add('WalletSkinSelected');
    }

    setUnSelected() {
        this.HTML.classList.remove('WalletSkinSelected');
    }

    setLock() {
        this.HTML.classList.add('WalletSkinLock');
        this.HTML_WalletSkinPrice.classList.add('WalletSkinLock');
    }

    setUnlock() {
        this.HTML.classList.remove('WalletSkinLock');
        this.HTML_WalletSkinPrice.classList.remove('WalletSkinLock');
    }

    constructor(WalletSkin: WalletSkin, URLOfWalletSkinImg: string) {
        this.WalletSkin = WalletSkin;

        this.HTML = document.createElement('div');
        this.HTML.classList.add('WalletSkinDiv');

        this.HTML_WalletSkinImg = document.createElement('img');
        this.HTML_WalletSkinImg.classList.add('WalletSkinImg');
        this.HTML_WalletSkinImg.src = URLOfWalletSkinImg;
        this.HTML.appendChild(this.HTML_WalletSkinImg);

        this.HTML_WalletSkinPrice = document.createElement('span');
        this.HTML_WalletSkinPrice.classList.add('WalletSkinPrice');
        this.HTML_WalletSkinPrice.innerText = ''
        this.HTML.appendChild(this.HTML_WalletSkinPrice);
    }
}

/**
 * Contains the html elements and the necessary methods for the user's iteration with
 * the streamer store and with the wallet Skins, the wallet also serves as a display 
 * of the viewer's Coin balance
 */
export default class ViewWalletDisplay {
    public ViewWalletSkins: ViewWalletSkin[];
    public WalletRelocatable: DivRelocatable;
    public CoinImgURL: string;
    public CoinName: string;

    public AutomaticHidingDueInactivity: AutomaticHidingDueInactivity;

    private HTML = <HTMLDivElement>document.getElementById("WalletDiv");

    public HTML_Wallet_Mask_0 = <HTMLDivElement>document.getElementById("Wallet_Mask_0");
    public HTML_Wallet_Mask_1 = <HTMLDivElement>document.getElementById("Wallet_Mask_1");

    private HTML_NavStoreButton = <HTMLButtonElement>document.getElementById("NavStoreButton");
    private HTML_NavSkinsButton = <HTMLButtonElement>document.getElementById("NavSkinsButton");

    private HTML_InsideOfWalletDiv = <HTMLDivElement>document.getElementById("InsideOfWalletDiv");

    private HTML_StreamerStorePageDiv = <HTMLDivElement>document.getElementById("StreamerStorePageDiv");
    private HTML_ItemsList = <HTMLDivElement>document.getElementById("ItemsList");

    private HTML_CoinsDiv = <HTMLDivElement>document.getElementById("CoinsDiv");
    public HTML_CoinsOfUserView = <HTMLElement>document.getElementById("CoinsOfUserView");

    private HTML_SkinsPageDiv = <HTMLDivElement>document.getElementById("SkinsPageDiv");
    private HTML_SkinsListDiv = <HTMLDivElement>document.getElementById("SkinsListDiv");

    public onNavStoreButtonActive = () => { };
    public onNavSkinsButtonActive = () => { };

    public onWalletSkinSelected = (ViewWalletSkin: ViewWalletSkin) => { };
    public onBuyItemButtonActive = (StoreItem: StoreItem) => { };

    private setNavSelected(navButton: HTMLButtonElement) {
        this.HTML_NavStoreButton.classList.remove('NavButtonEnable');
        this.HTML_NavSkinsButton.classList.remove('NavButtonEnable');

        navButton.classList.add('NavButtonEnable');
    }

    public setWalletsSkins(WalletSkins: WalletSkin[], getWalletSkinsURl: (WalletSkinsName: string) => string) {
        this.HTML_SkinsListDiv.innerHTML = '';
        this.ViewWalletSkins = [];

        WalletSkins.forEach(WalletSkin => {
            let viewWalletSkin = new ViewWalletSkin(WalletSkin, getWalletSkinsURl(WalletSkin.Name));
            if (window.localStorage['WalletSkinsSelectedName'] === WalletSkin.Name) viewWalletSkin.setSelected();

            this.ViewWalletSkins.push(viewWalletSkin);

            viewWalletSkin.HTML.onclick = () => {
                this.onWalletSkinSelected(viewWalletSkin);
            }

            this.HTML_SkinsListDiv.appendChild(viewWalletSkin.HTML);
        });
    }

    public DeselectAllWallets() {
        this.ViewWalletSkins.forEach(viewWalletSkins => {
            viewWalletSkins.setUnSelected();
        });
    }

    public setViewBalance(Balance: number, BalanceChange = 0) {
        if (BalanceChange > 0) {
            this.startDepositAnimation(~~BalanceChange + 1);
        }
        else if (BalanceChange < -1) {
            this.startWithdrawalAnimation((~~BalanceChange - 1) * -1);
        }

        if (!this.CoinName) this.CoinName = 'Coins';

        let lastChar = this.CoinName.charAt(this.CoinName.length - 1)
        this.HTML_CoinsOfUserView.innerText =
            ` ${(~~Balance).toString()}$${this.CoinName}${(lastChar === 's' || lastChar === 'S') ? '' : 's'}`;
    }

    public setSkinOfWallet(WalletSkinsSelectedName: string, getURLOfWalletSkinsImg: (arg0: string, arg1: number) => string) {
        this.HTML_Wallet_Mask_0.style.backgroundImage =
            `url(${getURLOfWalletSkinsImg(WalletSkinsSelectedName, 0)})`;

        this.HTML_Wallet_Mask_1.style.backgroundImage =
            `url(${getURLOfWalletSkinsImg(WalletSkinsSelectedName, 1)})`;
    }

    private async DepositAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {
        Coin.classList.add('Coin');
        if (this.CoinImgURL) Coin.style.backgroundImage = 'url(' + this.CoinImgURL + ')';

        Coin.style.left = `${((Math.random() >= 0.5) ? -36 : 70)}%`;
        Coin.style.top = '-50%';

        this.HTML_CoinsDiv.appendChild(Coin);

        let onTransitionStart = () => {
            Coin.removeEventListener('transitionstart', onTransitionStart);
            if (onStart) onStart();

        }
        Coin.addEventListener('transitionstart', onTransitionStart);

        let OnTransitionEnd = () => {
            Coin.removeEventListener('transitionend', OnTransitionEnd);
            if (onEnd) onEnd();

        };
        Coin.addEventListener('transitionend', OnTransitionEnd);

        await sleep(500 + CoinNumber * 250);

        Coin.style.opacity = '1';
        Coin.style.left = '36%';
        Coin.style.top = '-50%';

        await sleep(500 + CoinNumber * 5);
        Coin.style.top = '30%';

        this.AutomaticHidingDueInactivity.show(false, (500 + CoinNumber) * 2.5);
    }

    private async WithdrawalAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {

        Coin.classList.add('Coin');
        if (this.CoinImgURL) Coin.style.backgroundImage = 'url(' + this.CoinImgURL + ')';

        Coin.style.left = '36%';
        Coin.style.top = '15%';
        Coin.style.opacity = '1';

        this.HTML_CoinsDiv.appendChild(Coin);

        let OnTransitionStart = () => {
            Coin.removeEventListener('transitionstart', OnTransitionStart);
            if (onStart) onStart();

        }
        Coin.addEventListener('transitionstart', OnTransitionStart);

        let OnTransitionEnd = () => {
            Coin.removeEventListener('transitionend', OnTransitionEnd);
            if (onEnd) onEnd();

        };
        Coin.addEventListener('transitionend', OnTransitionEnd);

        await sleep(500 + CoinNumber * 500);

        Coin.style.left = '36%';
        Coin.style.top = -40 + (Math.random() * -20) + '%';

        await sleep(500 + CoinNumber * 5);
        Coin.style.top = '-60%';
        Coin.style.left = `${(CoinNumber % 2 === 0) ? (Math.random() * -36) : (Math.random() * 80)}%`;
        Coin.style.opacity = '0';

        this.AutomaticHidingDueInactivity.show(false);
    }

    private StartCoinsAnimation(reverse: boolean, CoinsNumber: number) {
        this.HTML_CoinsDiv.innerHTML = null;

        CoinsNumber = (CoinsNumber > 100) ? 100 : CoinsNumber;

        let addX = 0.1 / CoinsNumber;
        let addY = 0.2 / CoinsNumber;

        if (reverse) {
            for (let i = 0; i < CoinsNumber; i++) {
                this.WithdrawalAnimation(document.createElement('div'), i,
                    () => {
                        if (i === 0)
                            this.HTML_Wallet_Mask_0.classList.add('inAction');
                    },
                    () => {
                        this.HTML_Wallet_Mask_0.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            if (i === CoinsNumber - 1)
                                this.HTML_Wallet_Mask_0.classList.remove('inAction');
                            this.HTML_Wallet_Mask_0.style.transform = 'scale(1)';
                        }, 100);
                    })
            }
        } else {
            for (let i = 0; i < CoinsNumber; i++) {
                this.DepositAnimation(document.createElement('div'), i, null,
                    () => {
                        this.HTML_Wallet_Mask_0.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            this.HTML_Wallet_Mask_0.style.transform = 'scale(1)';
                        }, 100);
                    })
            }
        }
    }

    public startDepositAnimation(Deposit: number) {
        this.AutomaticHidingDueInactivity.show(false, (500) * 2.5);
        this.StartCoinsAnimation(false, Deposit);
    };

    public startWithdrawalAnimation(Withdrawal: number) {
        this.StartCoinsAnimation(true, Withdrawal);
    }

    private MakeSureItemIsAvailable(StoreItemID: number, PurchaseOrders: PurchaseOrder[]) {
        for (const key in PurchaseOrders) {
            if (PurchaseOrders[key].StoreItemID === StoreItemID)
                return true;
        }
        return false;
    }

    public updateStoreItems(StoreItems: StoreItem[], PurchaseOrders: PurchaseOrder[]) {
        this.HTML_ItemsList.innerHTML = '';
        StoreItems.forEach(StoreItem => {
            if (StoreItem.FileName && StoreItem.Description && StoreItem.Price) {
                let viewStoreItem = new ViewStoreItemDisplay(StoreItem.Description, StoreItem.Price,
                    (this.CoinName) ? this.CoinName.charAt(0) : '$');

                let SingleReproduction: ItemSetting = getItemsSetting('SingleReproduction', StoreItem.ItemsSettings);
                let ThereAlreadyAnItemInList = false;
                if (PurchaseOrders && SingleReproduction.Enable) {
                    ThereAlreadyAnItemInList = this.MakeSureItemIsAvailable(StoreItem.id, PurchaseOrders)
                }

                if (SingleReproduction.Enable && ThereAlreadyAnItemInList) {
                    viewStoreItem.setUnavailable();
                }
                else {
                    viewStoreItem.setAvailable();
                    viewStoreItem.HTML_BuyButton.onclick = () => {
                        this.onBuyItemButtonActive(StoreItem)
                    };
                }

                this.HTML_ItemsList.appendChild(viewStoreItem.HTML);
            }
        });
    }

    private setPageHide(Page: HTMLDivElement) {
        Page.classList.add('PageHide');
        Page.classList.remove('PageSample');
    }

    private setPageSample(Page: HTMLDivElement) {
        Page.classList.add('PageSample');
        Page.classList.remove('PageHide');
    }

    constructor() {
        this.HTML_Wallet_Mask_1.addEventListener('click', () => {
            if (this.HTML_InsideOfWalletDiv.classList.contains('StoreHide')) {
                this.HTML_InsideOfWalletDiv.classList.remove('StoreHide');
                this.HTML_InsideOfWalletDiv.classList.add('StoreSample');
            } else {
                this.HTML_InsideOfWalletDiv.classList.remove('StoreSample');
                this.HTML_InsideOfWalletDiv.classList.add('StoreHide');
            }
        })

        this.WalletRelocatable = new DivRelocatable(this.HTML, 0, 0);

        this.AutomaticHidingDueInactivity = new AutomaticHidingDueInactivity(document.body, [this.HTML], 5000);

        this.HTML_NavStoreButton.onclick = () => {
            this.setNavSelected(this.HTML_NavStoreButton);

            this.onNavStoreButtonActive();
            this.setPageSample(this.HTML_StreamerStorePageDiv);
            this.setPageHide(this.HTML_SkinsPageDiv);
        }

        this.HTML_NavSkinsButton.onclick = () => {
            this.setNavSelected(this.HTML_NavSkinsButton);

            this.onNavSkinsButtonActive();
            this.setPageSample(this.HTML_SkinsPageDiv);
            this.setPageHide(this.HTML_StreamerStorePageDiv);

        }
    }
}
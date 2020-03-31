import { sleep } from "../../../../utils/utils";
import PurchaseOrder from "../../../../services/models/store/PurchaseOrder";
import StoreItem from "../../../../services/models/store/StoreItem";
import { EnableRelocatableElemente } from "../../../common/model/ViewerFeatures";
import { NONAME } from "dns";
import { WalletSkin } from "../../../../services/models/wallet/WalletSkin";

class ViewStoreItemDisplay {
    HTML: HTMLDivElement
    HTML_TypeDisplay: HTMLImageElement;
    HTML_Description: HTMLSpanElement;
    HTML_Price: HTMLSpanElement;
    HTML_BuyButton: HTMLButtonElement;

    private createTypeDisplay() {
        this.HTML_TypeDisplay = document.createElement('img');
        this.HTML_TypeDisplay.src = 'video_overlay/images/sond-document.png';
        return this.HTML_TypeDisplay;
    }

    private createDescription(Description: string) {
        this.HTML_Description = document.createElement('span');
        this.HTML_Description.classList.add('Description');
        this.HTML_Description.innerText = Description;
        return this.HTML_Description;
    }

    private createPrice(Price: number) {
        this.HTML_Price = document.createElement('span');
        this.HTML_Price.classList.add('Price');
        this.HTML_Price.innerText = Price + '$';
        return this.HTML_Price;
    }

    private createBuyButton() {
        this.HTML_BuyButton = document.createElement('button');
        this.HTML_BuyButton.innerText = 'Buy';
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

    constructor(Description: string, Price: number) {
        this.HTML = <HTMLDivElement>document.createElement('div');
        this.HTML.classList.add('StoreItem');

        this.HTML.appendChild(this.createTypeDisplay())
        this.HTML.appendChild(this.createDescription(Description))
        this.HTML.appendChild(this.createPrice(Price))
        this.HTML.appendChild(this.createBuyButton())
    }
}

class ViewWalletSkin {
    HTML: HTMLDivElement;
    HTML_WalletSkinImg: HTMLImageElement;
    HTML_WalletSkinPrice: HTMLSpanElement;

    WalletSkin: WalletSkin;

    public get IsLock() : boolean {
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
        this.HTML_WalletSkinPrice.innerText = WalletSkin.Price + ' bits';
        this.HTML.appendChild(this.HTML_WalletSkinPrice);
    }
}

export default class ViewWalletDisplay {
    private WalletDiv = <HTMLDivElement>document.getElementById("WalletDiv");
    private Wallet = <HTMLDivElement>document.getElementById("Wallet");

    private NavStoreButtom = <HTMLButtonElement>document.getElementById("NavStoreButtom");
    private NavSkinsButtom = <HTMLButtonElement>document.getElementById("NavSkinsButtom");

    private InsideOfWalletDiv = <HTMLDivElement>document.getElementById("InsideOfWalletDiv");

    private StreamerStorePageDiv = <HTMLDivElement>document.getElementById("StreamerStorePageDiv");
    private ItemsList = <HTMLDivElement>document.getElementById("ItemsList");

    private CoinsDiv = <HTMLDivElement>document.getElementById("CoinsDiv");
    public CoinsOfUserView = <HTMLElement>document.getElementById("CoinsOfUserView");
    public CoinImgURL: string;

    private SkinsPageDiv = <HTMLDivElement>document.getElementById("SkinsPageDiv");
    private SkinsListDiv = <HTMLDivElement>document.getElementById("SkinsListDiv");

    onNavStoreButtomActive = () => { };
    onNavSkinsButtomActive = () => { };

    onWalletSkinSelected = (ViewWalletSkin:ViewWalletSkin) => { };

    onBuyItemButtonActive = (StoreItem: StoreItem) => { };

    setNavSelected(navButton: HTMLButtonElement) {
        this.NavStoreButtom.classList.remove('NavButtonEnable');
        this.NavSkinsButtom.classList.remove('NavButtonEnable');

        navButton.classList.add('NavButtonEnable');
    }

    setSkins(WalletSkins: WalletSkin[], BitsDonatedByViewer: number, getWalletSkinsURl: (WalletSkinsID: string) => string) {
        this.SkinsListDiv.innerHTML = '';

        WalletSkins.forEach(WalletSkin => {
            let viewWalletSkin = new ViewWalletSkin(WalletSkin, getWalletSkinsURl(WalletSkin.Name));
            if (BitsDonatedByViewer < WalletSkin.Price) viewWalletSkin.setLock();

            viewWalletSkin.HTML.onclick = () => {
                this.onWalletSkinSelected(viewWalletSkin);
            }

            this.SkinsListDiv.appendChild(viewWalletSkin.HTML);
        });
    }

    async DepositAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {
        Coin.classList.add('Coin');
        if (this.CoinImgURL) Coin.style.backgroundImage = 'url(' + this.CoinImgURL + ')';

        Coin.style.left = `${((Math.random() >= 0.5) ? -36 : 70)}%`;
        Coin.style.top = '-50%';

        this.CoinsDiv.appendChild(Coin);

        let ontransitionstart = () => {
            Coin.removeEventListener('transitionstart', ontransitionstart);
            if (onStart) onStart();

        }
        Coin.addEventListener('transitionstart', ontransitionstart);

        let ontransitionend = () => {
            Coin.removeEventListener('transitionend', ontransitionend);
            if (onEnd) onEnd();

        };
        Coin.addEventListener('transitionend', ontransitionend);

        await sleep(500 + CoinNumber * 250);

        Coin.style.opacity = '1';
        Coin.style.left = '36%';
        Coin.style.top = '-50%';

        await sleep(500 + CoinNumber * 5);
        Coin.style.top = '15%';
    }

    async WithdrawalAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {
        Coin.classList.add('Coin');
        if (this.CoinImgURL) Coin.style.backgroundImage = 'url(' + this.CoinImgURL + ')';

        Coin.style.left = '36%';
        Coin.style.top = '15%';
        Coin.style.opacity = '1';

        this.CoinsDiv.appendChild(Coin);

        let ontransitionstart = () => {
            Coin.removeEventListener('transitionstart', ontransitionstart);
            if (onStart) onStart();

        }
        Coin.addEventListener('transitionstart', ontransitionstart);

        let ontransitionend = () => {
            Coin.removeEventListener('transitionend', ontransitionend);
            if (onEnd) onEnd();

        };
        Coin.addEventListener('transitionend', ontransitionend);

        await sleep(500 + CoinNumber * 500);

        Coin.style.left = '36%';
        Coin.style.top = -40 + (Math.random() * -20) + '%';

        await sleep(500 + CoinNumber * 5);
        Coin.style.top = '-60%';
        Coin.style.left = `${(CoinNumber % 2 === 0) ? (Math.random() * -36) : (Math.random() * 80)}%`;
        Coin.style.opacity = '0';
    }

    StartCoinsAnimation(reverse: boolean, CoinsNumber: number) {
        this.CoinsDiv.innerHTML = null;

        let addX = 0.1 / CoinsNumber;
        let addY = 0.2 / CoinsNumber;

        if (reverse) {
            for (let i = 0; i < CoinsNumber; i++) {
                this.WithdrawalAnimation(document.createElement('div'), i,
                    () => {
                        if (i === 0)
                            this.Wallet.classList.add('inAction');
                    },
                    () => {
                        this.Wallet.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            if (i === CoinsNumber - 1)
                                this.Wallet.classList.remove('inAction');
                            this.Wallet.style.transform = 'scale(1)';
                        }, 100);
                    })
            }
        } else {
            for (let i = 0; i < CoinsNumber; i++) {
                this.DepositAnimation(document.createElement('div'), i, null,
                    () => {
                        this.Wallet.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            this.Wallet.style.transform = 'scale(1)';
                        }, 100);
                    })
            }
        }
    }

    startDepositAnimation(Deposit: number) {
        this.StartCoinsAnimation(false, Deposit);
    };

    startWithdrawalAnimation(Withdrawal: number) {
        this.StartCoinsAnimation(true, Withdrawal);
    }

    MakeSureItemIsAvailable(StoreItemID: number, PurchaseOrders: PurchaseOrder[]) {
        for (const key in PurchaseOrders) {
            if (PurchaseOrders[key].StoreItemID === StoreItemID)
                return true;
        }
        return false;
    }

    updateStoreItems(StoreItems: StoreItem[], PurchaseOrders: PurchaseOrder[]) {
        this.ItemsList.innerHTML = '';
        StoreItems.forEach(StoreItem => {
            if (StoreItem.FileName && StoreItem.Description && StoreItem.Price) {
                let viewStoreItem = new ViewStoreItemDisplay(StoreItem.Description, StoreItem.Price);

                let SingleReproductionEnable = (StoreItem.ItemsSettings.findIndex((Setting) => {
                    return Setting.DonorFeatureName === 'SingleReproduction' && Setting.Enable;
                }) !== -1);

                let ThereAlreadyAnItemInList = false;

                if (PurchaseOrders && SingleReproductionEnable) {
                    ThereAlreadyAnItemInList = this.MakeSureItemIsAvailable(StoreItem.id, PurchaseOrders)
                }

                if (SingleReproductionEnable && ThereAlreadyAnItemInList) {
                    viewStoreItem.setUnavailable();
                }
                else {
                    viewStoreItem.setAvailable();
                    viewStoreItem.HTML_BuyButton.onclick = () => { this.onBuyItemButtonActive(StoreItem) };
                }

                this.ItemsList.appendChild(viewStoreItem.HTML);
            }
        });
    }

    setPageHide(Page: HTMLDivElement) {
        Page.classList.add('PageHiden');
        Page.classList.remove('PageSample');
    }

    setPageSample(Page: HTMLDivElement) {
        Page.classList.add('PageSample');
        Page.classList.remove('PageHiden');
    }

    constructor() {
        this.Wallet.addEventListener('click', () => {
            if (this.InsideOfWalletDiv.classList.contains('StoreHide')) {
                this.InsideOfWalletDiv.classList.remove('StoreHide');
                this.InsideOfWalletDiv.classList.add('StoreSample');
            } else {
                this.InsideOfWalletDiv.classList.remove('StoreSample');
                this.InsideOfWalletDiv.classList.add('StoreHide');
            }
        })
        EnableRelocatableElemente(this.WalletDiv, 0, 0);

        this.NavStoreButtom.onclick = () => {
            this.setNavSelected(this.NavStoreButtom);

            this.onNavStoreButtomActive();
            this.setPageSample(this.StreamerStorePageDiv);
            this.setPageHide(this.SkinsPageDiv);
        }

        this.NavSkinsButtom.onclick = () => {
            this.setNavSelected(this.NavSkinsButtom);

            this.onNavSkinsButtomActive();
            this.setPageSample(this.SkinsPageDiv);
            this.setPageHide(this.StreamerStorePageDiv);

        }
    }
}
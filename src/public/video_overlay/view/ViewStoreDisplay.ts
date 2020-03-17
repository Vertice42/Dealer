import StoreItem from "../../../services/models/store/StoreItem";
import { EnableRelocatableElemente } from "../../common/model/viewerFeatures";
import { sleep } from "../../../utils/utils";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";

class ViewStoreItemDisplay {
    HTML: HTMLDivElement
    HTML_TypeDisplay: HTMLImageElement;
    HTML_Description: HTMLSpanElement;
    HTML_Price: HTMLSpanElement;
    HTML_BuyButton: HTMLButtonElement;

    private createTypeDisplay() {
        this.HTML_TypeDisplay = document.createElement('img');
        this.HTML_TypeDisplay.src = 'configurator/images/undefined-document.png';
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

export default class ViewStoreDisplay {
    private WalletDiv = <HTMLDivElement>document.getElementById("WalletDiv");
    private Wallet = <HTMLDivElement>document.getElementById("Wallet");
    private StoreDiv = <HTMLDivElement>document.getElementById("StoreDiv");
    private ItemsList = <HTMLDivElement>document.getElementById("ItemsList");

    private CoinsDiv = <HTMLDivElement>document.getElementById("CoinsDiv");
    public CoinsOfUserView = <HTMLElement>document.getElementById("CoinsOfUserView");
    public CoinImgURL: string;

    onBuyItemButtonActive = (StoreItem: StoreItem) => { };

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

    constructor() {
        this.Wallet.addEventListener('click', () => {
            if (this.StoreDiv.classList.contains('StoreHide')) {
                this.StoreDiv.classList.remove('StoreHide');
                this.StoreDiv.classList.add('StoreSample');
            } else {
                this.StoreDiv.classList.remove('StoreSample');
                this.StoreDiv.classList.add('StoreHide');
            }
        })
        EnableRelocatableElemente(this.WalletDiv, 0, 0);
    }
}
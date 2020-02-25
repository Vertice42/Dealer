import StoreItem from "../../../services/models/store/StoreItem";
import { EnableRelocatableElemente } from "../../common/model/viewerFeatures";

class ViewStoreItemDisplay {
    HTML: HTMLDivElement
    HTML_TypeDisplay: HTMLImageElement;
    HTML_Description: HTMLSpanElement;
    HTML_Price: HTMLSpanElement;
    HTML_BuyButton: HTMLButtonElement;

    createTypeDisplay() {
        this.HTML_TypeDisplay = document.createElement('img');
        this.HTML_TypeDisplay.src = 'configurator/images/undefined-document.png';
        return this.HTML_TypeDisplay;
    }

    createDescription(Description: string) {
        this.HTML_Description = document.createElement('span');
        this.HTML_Description.classList.add('Description');
        this.HTML_Description.innerText = Description;
        return this.HTML_Description;
    }

    createPrice(Price: number) {
        this.HTML_Price = document.createElement('span');
        this.HTML_Price.classList.add('Price');
        this.HTML_Price.innerText = Price + '$';
        return this.HTML_Price;
    }

    createBuyButton() {
        this.HTML_BuyButton = document.createElement('button');
        this.HTML_BuyButton.innerText = 'Buy';
        return this.HTML_BuyButton;
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
    public StoreItem: ViewStoreItemDisplay

    private WalletDiv = <HTMLDivElement>document.getElementById("WalletDiv");
    private Wallet = <HTMLDivElement>document.getElementById("Wallet");
    private StoreDiv = <HTMLDivElement>document.getElementById("StoreDiv");
    private ItemsList = <HTMLDivElement>document.getElementById("ItemsList");

    private CoinsDiv = <HTMLDivElement>document.getElementById("CoinsDiv");
    public CoinsOfUserView = <HTMLElement>document.getElementById("CoinsOfUserView");
    public CoinImgURL: string;

    onBuyItemButtonActive = (StoreItem: StoreItem) => { };

    DepositAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {
        Coin.classList.add('Coin');
        if (this.CoinImgURL) Coin.style.backgroundImage = 'url(' + this.CoinImgURL + ')';

        Coin.style.left = -35 + (CoinNumber * 15) + '%';
        Coin.style.top = -50 + '%';

        this.CoinsDiv.appendChild(Coin);

        setTimeout(() => {
            Coin.style.opacity = '1';
            Coin.style.left = '35%'
            Coin.style.top = '-50%'
            setTimeout(() => {
                let ontransitionstart = function () {
                    Coin.removeEventListener('transitionstart', ontransitionstart);
                    if (onStart) onStart();

                }
                Coin.addEventListener('transitionstart', ontransitionstart);

                let ontransitionend = function () {
                    Coin.removeEventListener('transitionend', ontransitionend);
                    if (onEnd) onEnd();

                };
                Coin.addEventListener('transitionend', ontransitionend);

                Coin.style.top = '10%'
            }, 500 + CoinNumber * 10);
        }, 500 + CoinNumber * 500);
    }

    WithdrawalAnimation(Coin: HTMLDivElement, CoinNumber: number, onStart: () => void, onEnd: () => void) {
        Coin.classList.add('Coin');
        this.CoinsDiv.appendChild(Coin);

        setTimeout(() => {
            Coin.style.opacity = '1';
            Coin.style.left = '35%'
            Coin.style.top = '10%'
            setTimeout(() => {
                let ontransitionstart = function () {
                    Coin.style.opacity = '0';
                    Coin.removeEventListener('transitionstart', ontransitionstart);
                    if (onStart) onStart();

                }
                Coin.addEventListener('transitionstart', ontransitionstart);

                let ontransitionend = function () {
                    Coin.removeEventListener('transitionend', ontransitionend);
                    if (onEnd) onEnd();

                };
                Coin.addEventListener('transitionend', ontransitionend);

                Coin.style.top = '-50%'

            }, 500 + CoinNumber * 10);
        }, 500 + CoinNumber * 500);
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
                            this.WalletDiv.classList.add('inAction');
                    },
                    () => {
                        this.WalletDiv.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            if (i === CoinsNumber - 1)
                                this.WalletDiv.classList.remove('inAction');
                            this.WalletDiv.style.transform = 'scale(1)';
                        }, 100);
                    })
            }
        } else {
            for (let i = 0; i < CoinsNumber; i++) {
                this.DepositAnimation(document.createElement('div'), i, null,
                    () => {
                        this.WalletDiv.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                        setTimeout(() => {
                            this.WalletDiv.style.transform = 'scale(1)';
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

    setStoreItems(StoreItems: StoreItem[]) {
        this.ItemsList.innerHTML = '';
        StoreItems.forEach(StoreItem => {
            if (StoreItem.FileName) {
                let viewStoreItem = new ViewStoreItemDisplay(StoreItem.Description, StoreItem.Price);
                viewStoreItem.HTML_BuyButton.onclick = () => { this.onBuyItemButtonActive(StoreItem) }
                this.ItemsList.appendChild(viewStoreItem.HTML);
            }
        });
    }

    constructor(){
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
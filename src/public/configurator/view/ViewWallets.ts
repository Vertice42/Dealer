import { Wallet } from "../../../services/models/poll/dbWallet";
import { ResponsiveInput } from "../../common/model/Inputs";

export class ViewWallet {
    HTML: HTMLDivElement;
    InputOfCoinsOfWalletOfUser: ResponsiveInput;

    private createPlacing(Placing: number) {
        let placing = document.createElement('span');
        placing.classList.add('Placing');
        placing.innerText = '#' + Placing;
        return placing;
    }

    private createTwitchUserID(TwitchUserID: string) {
        let twitchUserID = document.createElement('span');
        twitchUserID.classList.add('TwitchUserID');
        twitchUserID.innerText = '@' + TwitchUserID;
        return twitchUserID;
    }

    constructor(Placing: number, TwitchUserID: string, CoinsOfWalletOfUser: number) {
        this.HTML = document.createElement('div');
        this.HTML.classList.add('WalletOfUser');

        this.InputOfCoinsOfWalletOfUser = new ResponsiveInput();
        this.InputOfCoinsOfWalletOfUser.setUnchangedInput();
        this.InputOfCoinsOfWalletOfUser.HTMLInput.value = CoinsOfWalletOfUser.toString();

        this.HTML.appendChild(this.createPlacing(Placing));
        this.HTML.appendChild(this.createTwitchUserID(TwitchUserID));
        this.HTML.appendChild(this.InputOfCoinsOfWalletOfUser.HTMLInput);
    }
}

export default class ViewWallets {
    HTML_DivOfWallets = <HTMLDivElement>document.getElementById('DivOfWallets');
    HTML_SearchInput = <HTMLInputElement>document.getElementById('SearchInput');
    HTMl_SearchInputButton = <HTMLButtonElement>document.getElementById('SearchInputButton');
    onWalletInputChange = (TwitchUserID: string, viewWallet: ViewWallet) => { };
    onWalletInputInFocus = (TwitchUserID: string, viewWallet: ViewWallet) => { };
    onWalletInputFocusOut = (TwitchUserID: string, viewWallet: ViewWallet) => { };

    uptate(Wallets: Wallet[]) {
        this.HTML_DivOfWallets.innerHTML = '';
        Wallets.forEach((Wallet, index) => {
            let viewWallet = new ViewWallet(index + 1, Wallet.TwitchUserID, (~~Wallet.Coins));
            viewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.onchange = () => {
                this.onWalletInputChange(Wallet.TwitchUserID, viewWallet);
            };
            viewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.onfocus = () => {
                this.onWalletInputInFocus(Wallet.TwitchUserID, viewWallet);
            }

            viewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.addEventListener('focusout',() => {
                this.onWalletInputFocusOut(Wallet.TwitchUserID, viewWallet);
            }) 

            this.HTML_DivOfWallets.appendChild(viewWallet.HTML);
        });
    }
    constructor() {
    }
}

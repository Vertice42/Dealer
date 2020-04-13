import { Wallet } from "../../../services/models/poll/dbWallet";
import { ResponsiveInput } from "../../common/view/Inputs";

/**
 * Is a viewer so that the streamer can see the careers of users
 */
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

        let input = document.createElement('input');
        input.classList.add('CoinsOfWalletOfUser');
        input.type = 'number';
        input.max = '9999999';

        this.InputOfCoinsOfWalletOfUser = new ResponsiveInput(input);
        this.InputOfCoinsOfWalletOfUser.setUnchangedInput();
        this.InputOfCoinsOfWalletOfUser.HTML.value = CoinsOfWalletOfUser.toString();

        this.HTML.appendChild(this.createPlacing(Placing));
        this.HTML.appendChild(this.createTwitchUserID(TwitchUserID));
        this.HTML.appendChild(this.InputOfCoinsOfWalletOfUser.HTML);
    }
}

/**
 * Contains html elements and methods for the streamer to manage the wallets
 */
export default class ViewWallets {
    HTML_DivOfWallets = <HTMLDivElement>document.getElementById('DivOfWallets');
    HTML_SearchInput = <HTMLInputElement>document.getElementById('SearchInput');
    HTMl_SearchInputButton = <HTMLButtonElement>document.getElementById('SearchInputButton');
    onWalletInputChange = (TwitchUserID: string, viewWallet: ViewWallet) => { };
    onWalletInputInFocus = (TwitchUserID: string, viewWallet: ViewWallet) => { };
    onWalletInputFocusOut = (TwitchUserID: string, viewWallet: ViewWallet) => { };

    update(Wallets: Wallet[]) {
        this.HTML_DivOfWallets.innerHTML = '';
        Wallets.forEach((Wallet, index) => {
            let viewWallet = new ViewWallet(index + 1, Wallet.TwitchUserID, (~~Wallet.Coins));
            viewWallet.InputOfCoinsOfWalletOfUser.HTML.onchange = () => {
                this.onWalletInputChange(Wallet.TwitchUserID, viewWallet);
            };
            viewWallet.InputOfCoinsOfWalletOfUser.HTML.onfocus = () => {
                this.onWalletInputInFocus(Wallet.TwitchUserID, viewWallet);
            }

            viewWallet.InputOfCoinsOfWalletOfUser.HTML.addEventListener('focusout', () => {
                this.onWalletInputFocusOut(Wallet.TwitchUserID, viewWallet);
            })

            this.HTML_DivOfWallets.appendChild(viewWallet.HTML);
        });
    }
    constructor() {
    }
}

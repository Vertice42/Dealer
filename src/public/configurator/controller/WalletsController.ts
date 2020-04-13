import { sleep } from "../../../utils/functions";
import { Wallet } from "../../../services/models/poll/dbWallet";
import ViewWallets from "../view/ViewWallets";
import { GetWallets, ManagerWallets } from "../../common/BackendConnection/Wallets";
import { WalletManagerRequest } from "../../../services/models/wallet/WalletManagerRequest";
import { Observer } from "../../../utils/Observer";

/**
 * Connects the streamer actions to the back end to manage the users wallets
 */
export default class WalletsController {
    private Token: string;
    private StreamerID: string;
    private ViewWallets = new ViewWallets;
    private WatchWallets: Observer;

    private async EnableAllCommands() {
        let Search = async () => {
            let TwitchUserID = this.ViewWallets.HTML_SearchInput.value;
            if (TwitchUserID !== '') {
                await this.WatchWallets.stop();
                this.ViewWallets.update(await GetWallets(this.StreamerID, TwitchUserID));
            } else {
                this.WatchWallets.start();
            }
        }

        this.ViewWallets.HTML_SearchInput.onchange = Search

        this.ViewWallets.HTMl_SearchInputButton.onclick = Search;

        let InputInUse = false;

        this.ViewWallets.onWalletInputChange = (TwitchUserID, ViewWallet) => {
            InputInUse = true;

            ViewWallet.InputOfCoinsOfWalletOfUser.setChangedInput();

            ManagerWallets(new WalletManagerRequest(this.Token, TwitchUserID, Number(ViewWallet.InputOfCoinsOfWalletOfUser.HTML.value)))
                .then(async () => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputSuccessfully();
                    await sleep(500)
                    ViewWallet.InputOfCoinsOfWalletOfUser.setUnchangedInput()
                })
                .catch((rej) => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputError()
                })

        }

        let ObserverUseOfInput = () => setTimeout(() => {
            if (InputInUse) ObserverUseOfInput();
            else this.WatchWallets.start()
            InputInUse = false;
        }, 5000);

        this.ViewWallets.onWalletInputInFocus = async () => {
            InputInUse = true;
            await this.WatchWallets.stop();
            ObserverUseOfInput();
        }
    }

    private loadingWallets() {
        this.WatchWallets = new Observer(() => GetWallets(this.StreamerID), 200);
        this.WatchWallets.OnWatch = (Wallets: Wallet[]) => this.ViewWallets.update(Wallets);

        this.EnableAllCommands();
    }

    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;

        this.loadingWallets();
    }
}
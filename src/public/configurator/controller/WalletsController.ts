import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/utils";
import { Wallet } from "../../../services/models/poll/dbWallet";
import ViewWallets from "../view/ViewWallets";

export default class WalletsController {
    StreamerID: string;
    ViewWallets = new ViewWallets;
    WatchWallets: BackendConnections.Observer;

    async EnbleAllCommands() {
        let Search = async () => {
            let TwitchUserID = this.ViewWallets.HTML_SearchInput.value;
            if (TwitchUserID !== '') {
                await this.WatchWallets.stop();
                this.ViewWallets.uptate(await BackendConnections.GetWallets(this.StreamerID, TwitchUserID));
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

            BackendConnections.SendToWalletManager(this.StreamerID, TwitchUserID, Number(ViewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.value))
                .then(async () => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentSuccessfully();
                    await sleep(500)
                    ViewWallet.InputOfCoinsOfWalletOfUser.setUnchangedInput()
                })
                .catch((rej) => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentError()
                })

        }

        let ObesrverUseOfInput = () => setTimeout(() => {
            if (InputInUse) ObesrverUseOfInput();
            else this.WatchWallets.start()
            InputInUse = false;
        }, 5000);

        this.ViewWallets.onWalletInputInFocus = async () => {
            InputInUse = true;
            await this.WatchWallets.stop();
            ObesrverUseOfInput();
        }
    }

    loadingWallets() {
        this.WatchWallets = new BackendConnections.Observer(() => BackendConnections.GetWallets(this.StreamerID), 200);
        this.WatchWallets.OnWaitch = (Wallets: Wallet[]) => this.ViewWallets.uptate(Wallets);

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;

        this.loadingWallets();
    }
}
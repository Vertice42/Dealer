import ViewConfig = require("../View");
import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/utils";
import { Wallet } from "../../../services/models/poll/dbWallet";

export default class WalletsController {
    StreamerID: string;
    ViewWallets = new ViewConfig.ViewWallets();
    WatchWallets: BackendConnections.Watch


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

        this.ViewWallets.onWalletInputChange = (TwitchUserID, ViewWallet) => {
            ViewWallet.InputOfCoinsOfWalletOfUser.setChangedInput();

            BackendConnections.SendToWalletManager(
                this.StreamerID,
                TwitchUserID,
                Number(ViewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.value))
                .then(async () => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentSuccessfully();
                    await sleep(500)
                    ViewWallet.InputOfCoinsOfWalletOfUser.setUnchangedInput()
                })
                .catch((rej) => {
                    ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentError()
                })
        }
    }

    loadingWallets() {
        this.WatchWallets = new BackendConnections.Watch(() => BackendConnections.GetWallets(this.StreamerID));
        this.WatchWallets.OnWaitch = (Wallets: Wallet[]) => this.ViewWallets.uptate(Wallets);

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;

        this.loadingWallets();
    }
}
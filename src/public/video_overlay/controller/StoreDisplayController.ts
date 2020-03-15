import BackendConnections = require("../../BackendConnection");
import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import ViewStoreDisplay from "../view/ViewStoreDisplay";
import { dbWallet } from "../../../services/models/poll/dbWallet";
import StoreItem from "../../../services/models/store/StoreItem";
import TwitchListeners from "../../../services/TwitchListeners";
import { addTwitchListeners } from "./MainController";

export default class StoreDisplayController {
    StreamerID: string;
    TwitchUserID: string;
    ViewStoreDisplay = new ViewStoreDisplay();


    setViewBalance(Balance: number, BalanceChange = 0) {
        if (BalanceChange > 0) {
            this.ViewStoreDisplay.startDepositAnimation(~~BalanceChange + 1);
        }
        else {
            if (BalanceChange <= -1) {
                this.ViewStoreDisplay.startWithdrawalAnimation((~~BalanceChange + 1) * -1);
            }
        }
        this.ViewStoreDisplay.CoinsOfUserView.innerText = (~~Balance).toString();
    }

    async EnbleAllCommands() {
        this.ViewStoreDisplay.onBuyItemButtonActive = (StoreItem: StoreItem) => {
            BackendConnections.addPurchaseOrder(this.StreamerID, this.TwitchUserID, StoreItem);
        }
    }

    async LoadingStore() {
        let CoinsSettings: CoinsSettings = await BackendConnections.GetCoinsSettings(this.StreamerID);
        if (CoinsSettings.FileNameOfCoinImage)
            this.ViewStoreDisplay.CoinImgURL = BackendConnections.getUrlOfFile(this.StreamerID, 'CoinImage', CoinsSettings.FileNameOfCoinImage);

        let WalletOfUser: dbWallet = await BackendConnections.GetWallets(this.StreamerID, this.TwitchUserID);
        this.ViewStoreDisplay.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

        this.ViewStoreDisplay.updateStoreItems(
            await BackendConnections.GetStore(this.StreamerID, -1),
            await BackendConnections.GetPurchaseOrders(this.StreamerID));

        addTwitchListeners(TwitchListeners.onStoreChaneg, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await BackendConnections.GetStore(this.StreamerID, -1),
                await BackendConnections.GetPurchaseOrders(this.StreamerID));        })

        addTwitchListeners(TwitchListeners.onAddPurchasedItem, async () => {            
            this.ViewStoreDisplay.updateStoreItems(
                await BackendConnections.GetStore(this.StreamerID, -1),
                await BackendConnections.GetPurchaseOrders(this.StreamerID));
        })

        addTwitchListeners(TwitchListeners.onDeletePurchaseOrder, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await BackendConnections.GetStore(this.StreamerID, -1),
                await BackendConnections.GetPurchaseOrders(this.StreamerID));
        })

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string, TwitchUserID: string) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.LoadingStore()
    }
}
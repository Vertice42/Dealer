import BackendConnections = require("../../BackendConnection");
import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import { dbWallet } from "../../../services/models/poll/dbWallet";
import StoreItem from "../../../services/models/store/StoreItem";
import TwitchListeners from "../../../services/TwitchListeners";
import { addTwitchListeners } from "./MainController";
import ViewWalletDisplay from "../view/Wallet/ViewStoreDisplay";
import { WalletSkin } from "../../../services/models/wallet/WalletSkin";

export default class StoreDisplayController {
    StreamerID: string;
    TwitchUserID: string;
    CoinName: string;
    ViewStoreDisplay = new ViewWalletDisplay();


    setViewBalance(Balance: number, BalanceChange = 0) {
        if (BalanceChange > 0) {
            this.ViewStoreDisplay.startDepositAnimation(~~BalanceChange + 1);
        }
        else {
            if (BalanceChange <= -1) {
                this.ViewStoreDisplay.startWithdrawalAnimation((~~BalanceChange + 1) * -1);
            }
        }
        this.ViewStoreDisplay.CoinsOfUserView.innerText = (~~Balance).toString() +'$ '+ this.CoinName+'s';
    }

    async EnbleAllCommands() {
        this.ViewStoreDisplay.onBuyItemButtonActive = (StoreItem: StoreItem) => {
            BackendConnections.addPurchaseOrder(this.StreamerID, this.TwitchUserID, StoreItem);
        }

        this.ViewStoreDisplay.onNavSkinsButtomActive = () => {
            this.ViewStoreDisplay.setSkins([new WalletSkin('charles',0),new WalletSkin('charles',200)],100,()=>{
                return 'http://127.0.0.1:5500/build/public/video_overlay/images/piggy_bank/mask_0.png';
            })
        }

    }

    async LoadingStore() {
        let CoinsSettings: CoinsSettings = await BackendConnections.GetCoinsSettings(this.StreamerID);
        if (CoinsSettings.FileNameOfCoinImage)
            this.ViewStoreDisplay.CoinImgURL = BackendConnections.getUrlOfFile(this.StreamerID, 'CoinImage', CoinsSettings.FileNameOfCoinImage);

        let WalletOfUser: dbWallet = await BackendConnections.GetWallet(this.StreamerID, this.TwitchUserID);
        this.ViewStoreDisplay.CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

        this.CoinName = (await BackendConnections.GetCoinsSettings(this.StreamerID)).CoinName;

        this.ViewStoreDisplay.updateStoreItems(
            await BackendConnections.GetStore(this.StreamerID, -1),
            await BackendConnections.GetPurchaseOrders(this.StreamerID));

        addTwitchListeners(TwitchListeners.onCoinNameChange, async (newCoinName) => {
            this.CoinName = newCoinName;
        })

        addTwitchListeners(TwitchListeners.onStoreChange, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await BackendConnections.GetStore(this.StreamerID, -1),
                await BackendConnections.GetPurchaseOrders(this.StreamerID));
        })

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
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
        let lastChar = this.CoinName.charAt(this.CoinName.length-1)
        this.ViewStoreDisplay.CoinsOfUserView.innerText = 
        ` ${(~~Balance).toString()}$${this.CoinName}${(lastChar === 's'|| lastChar === 'S') ? '' : 's'}`;
    }

    setSkinOfWallet(WalletSkinsSelectedName) {

        this.ViewStoreDisplay.Wallet_Mask_0.style.backgroundImage = 'url(' + BackendConnections.getURLOfWalletSkinsImage(WalletSkinsSelectedName, 0) + ')'
        this.ViewStoreDisplay.Wallet_Mask_1.style.backgroundImage = 'url(' + BackendConnections.getURLOfWalletSkinsImage(WalletSkinsSelectedName, 1) + ')'

    }

    async EnbleAllCommands() {
        this.ViewStoreDisplay.onBuyItemButtonActive = (StoreItem: StoreItem) => {
            BackendConnections.addPurchaseOrder(this.StreamerID, this.TwitchUserID, StoreItem);
        }

        this.ViewStoreDisplay.onNavSkinsButtomActive = async () => {
            let WalletSkins = <WalletSkin[]>await BackendConnections.getWalletSkins();
            this.ViewStoreDisplay.setWalletSkins(WalletSkins, 100, (WalletSkinsName: string) => {
                return BackendConnections.getURLOfWalletSkinsImage(WalletSkinsName, 0);
            })
        }

        this.ViewStoreDisplay.onWalletSkinSelected = (ViewWalletSkins) => {
            this.setSkinOfWallet(ViewWalletSkins.WalletSkin.Name);
            this.ViewStoreDisplay.UnSelectedAllWallets();
            window.localStorage['WalletSkinsSelectedName'] = ViewWalletSkins.WalletSkin.Name;
            ViewWalletSkins.setSelected();
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

        let WalletSkins = <WalletSkin[]>await BackendConnections.getWalletSkins();

        let WalletSkinsSelectedName = window.localStorage['WalletSkinsSelectedName'];
        if (!WalletSkinsSelectedName) {
            WalletSkinsSelectedName = WalletSkins[0].Name;
            window.localStorage['WalletSkinsSelectedName'] = WalletSkinsSelectedName;
        }

        this.setSkinOfWallet(WalletSkinsSelectedName);

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
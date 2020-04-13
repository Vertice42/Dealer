import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import { dbWallet } from "../../../services/models/poll/dbWallet";
import StoreItem from "../../../services/models/store/StoreItem";
import TwitchListeners from "../../../services/TwitchListeners";
import { addTwitchListeners } from "./MainController";
import { WalletSkin } from "../../../services/models/wallet/WalletSkin";
import { TwitchListener } from "../../common/model/TwitchListener";
import ViewWalletDisplay from "../view/ViewStoreDisplay";
import { GetCoinsSettings } from "../../common/BackendConnection/Coins";
import { GetWallet } from "../../common/BackendConnection/Wallets";
import { GetStore } from "../../common/BackendConnection/Store";
import { getURLOfWalletSkinsImg, getWalletSkins, getUrlOfFile } from "../../common/BackendConnection/BlobFiles";
import { addPurchaseOrder, GetPurchaseOrders } from "../../common/BackendConnection/PurchaseOrders";

/**
 * Control the update and make store items available and intermediate 
 * the connection of the user's actions with the backend
 */
export default class StoreDisplayController {
    private Token: string;
    private StreamerID: string;
    private TwitchUserID: string;
    private CoinName: string;
    private ViewStoreDisplay = new ViewWalletDisplay();

    public setViewBalance(Balance: number, BalanceChange = 0) {
        if (BalanceChange > 0) {
            this.ViewStoreDisplay.startDepositAnimation(~~BalanceChange + 1);
        }
        else if (BalanceChange <= -1) {
            this.ViewStoreDisplay.startWithdrawalAnimation((~~BalanceChange + 1) * -1);
        }
        if (this.CoinName === undefined) this.CoinName = 'Coins';

        let lastChar = this.CoinName.charAt(this.CoinName.length - 1)
        this.ViewStoreDisplay.HTML_CoinsOfUserView.innerText =
            ` ${(~~Balance).toString()}$${this.CoinName}${(lastChar === 's' || lastChar === 'S') ? '' : 's'}`;
    }

    private setSkinOfWallet(WalletSkinsSelectedName: string) {
        this.ViewStoreDisplay.HTML_Wallet_Mask_0.style.backgroundImage =
            `url(${getURLOfWalletSkinsImg(WalletSkinsSelectedName, 0)})`;

        this.ViewStoreDisplay.HTML_Wallet_Mask_1.style.backgroundImage =
            `url(${getURLOfWalletSkinsImg(WalletSkinsSelectedName, 1)})`;
    }

    private async setListeners() {
        this.ViewStoreDisplay.onBuyItemButtonActive = (StoreItem: StoreItem) => {
            addPurchaseOrder(this.Token, this.TwitchUserID, StoreItem);
        }

        this.ViewStoreDisplay.onNavSkinsButtonActive = async () => {
            let WalletSkins = <WalletSkin[]>await getWalletSkins();
            this.ViewStoreDisplay.setWalletSkins(WalletSkins, 100, (WalletSkinsName: string) => {
                return getURLOfWalletSkinsImg(WalletSkinsName, 0);
            })
        }

        this.ViewStoreDisplay.onWalletSkinSelected = (ViewWalletSkins) => {
            this.setSkinOfWallet(ViewWalletSkins.WalletSkin.Name);
            this.ViewStoreDisplay.DeselectAllWallets();
            window.localStorage['WalletSkinsSelectedName'] = ViewWalletSkins.WalletSkin.Name;
            ViewWalletSkins.setSelected();
        }

        addTwitchListeners(new TwitchListener(TwitchListeners.onCoinNameChange, async (newCoinName: string) => {
            this.CoinName = newCoinName;
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onStoreChange, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onAddPurchasedItem, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onDeletePurchaseOrder, async () => {
            this.ViewStoreDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }))
    }

    private async LoadingStore() {
        let CoinsSettings: CoinsSettings = await GetCoinsSettings(this.StreamerID);
        if (CoinsSettings.FileNameOfCoinImage)
            this.ViewStoreDisplay.CoinImgURL = getUrlOfFile(this.StreamerID, 'CoinImage', CoinsSettings.FileNameOfCoinImage);

        let WalletOfUser: dbWallet = await GetWallet(this.StreamerID, this.TwitchUserID);
        this.ViewStoreDisplay.HTML_CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

        this.CoinName = (await GetCoinsSettings(this.StreamerID)).CoinName;

        this.ViewStoreDisplay.updateStoreItems(
            await GetStore(this.StreamerID, -1),
            await GetPurchaseOrders(this.StreamerID));

        let WalletSkins = <WalletSkin[]>await getWalletSkins();

        let WalletSkinsSelectedName = window.localStorage['WalletSkinsSelectedName'];
        if (!WalletSkinsSelectedName) {
            WalletSkinsSelectedName = WalletSkins[0].Name;
            window.localStorage['WalletSkinsSelectedName'] = WalletSkinsSelectedName;
        }

        this.setSkinOfWallet(WalletSkinsSelectedName);

        this.setListeners();
    }

    constructor(Token: string, StreamerID: string, TwitchUserID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.LoadingStore()
    }
}
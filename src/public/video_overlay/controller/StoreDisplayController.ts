import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import { dbWallet } from "../../../services/models/poll/dbWallet";
import StoreItem from "../../../services/models/store/StoreItem";
import TwitchListeners from "../../../services/models/listeners/TwitchListeners";
import { addTwitchListeners } from "./MainController";
import { WalletSkin } from "../../../services/models/wallet/WalletSkin";
import { TwitchListener } from "../../common/model/TwitchListener";
import ViewWalletDisplay, { ViewWalletSkin } from "../view/ViewStoreDisplay";
import { GetCoinsSettings } from "../../common/BackendConnection/Coins";
import { GetWallet } from "../../common/BackendConnection/Wallets";
import { GetStore } from "../../common/BackendConnection/Store";
import { getURLOfWalletSkinsImg, getWalletSkins, getUrlOfFile } from "../../common/BackendConnection/BlobFiles";
import { addPurchaseOrder, GetPurchaseOrders } from "../../common/BackendConnection/PurchaseOrders";
import { getTransitionsByUser as getTransitionsByUser, updateTransitionsByUser } from "../../common/BackendConnection/ExtensionProducts";
import { UpdateTransitionsByUserRequest as UpdateTransitionsByUserRequest } from "../../../services/models/dealer/UpdateProductsPurchasedByUserRequest";

/**
 * Control the update and make store items available and intermediate 
 * the connection of the user's actions with the backend
 */
export default class StoreDisplayController {
    private Token: string;
    private StreamerID: string;
    private TwitchUserID: string;

    ViewWalletDisplay: ViewWalletDisplay;

    private SelectSkinOfWallet(ViewWalletSkins: ViewWalletSkin) {
        this.ViewWalletDisplay.setSkinOfWallet(ViewWalletSkins.WalletSkin.Name, getURLOfWalletSkinsImg);
        this.ViewWalletDisplay.DeselectAllWallets();
        window.localStorage['WalletSkinsSelectedName'] = ViewWalletSkins.WalletSkin.Name;
        ViewWalletSkins.setSelected();
    }

    private async setListeners() {
        this.ViewWalletDisplay.onBuyItemButtonActive = (StoreItem: StoreItem) => {
            addPurchaseOrder(this.Token, this.TwitchUserID, StoreItem);
        }

        this.ViewWalletDisplay.onNavSkinsButtonActive = async () => {
            let WalletSkins = <WalletSkin[]>await getWalletSkins();
            this.ViewWalletDisplay.setWalletsSkins(WalletSkins, (WalletSkinsName: string) => {
                return getURLOfWalletSkinsImg(WalletSkinsName, 0);
            })

            let TransitionsByUser = [];
            (await getTransitionsByUser(this.Token)).forEach(transition => {
                TransitionsByUser[transition.product.sku] = transition;
            });

            let products = [];
            (await window.Twitch.ext.bits.getProducts()).forEach(product => {
                products[product.sku] = product;
            });

            this.ViewWalletDisplay.ViewWalletSkins.forEach(ViewWalletSkin => {
                let product: TwitchExtBitsProduct = products[ViewWalletSkin.WalletSkin.sku];
                if (TransitionsByUser[ViewWalletSkin.WalletSkin.sku] || ViewWalletSkin.WalletSkin.ItIsFree) {
                    ViewWalletSkin.setUnlock();
                } else {
                    ViewWalletSkin.setLock();
                    ViewWalletSkin.Price = Number(product.cost.amount);
                }
            });
        }

        this.ViewWalletDisplay.onWalletSkinSelected = (ViewWalletSkins) => {
            if (ViewWalletSkins.IsLock) {
                //window.Twitch.ext.bits.setUseLoopback(true);
                window.Twitch.ext.bits.useBits(ViewWalletSkins.WalletSkin.sku);
                window.Twitch.ext.bits.onTransactionComplete(async (Transaction) => {
                    await updateTransitionsByUser(new UpdateTransitionsByUserRequest(this.Token, Transaction))
                    ViewWalletSkins.setUnlock();
                    this.SelectSkinOfWallet(ViewWalletSkins);
                })
            } else {
                this.SelectSkinOfWallet(ViewWalletSkins);
            }
        }

        addTwitchListeners(new TwitchListener(TwitchListeners.onCoinNameChange, async (newCoinName: string) => {
            this.ViewWalletDisplay.CoinName = newCoinName;
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onStoreChange, async () => {
            this.ViewWalletDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onAddPurchasedItem, async () => {
            this.ViewWalletDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }));

        addTwitchListeners(new TwitchListener(TwitchListeners.onDeletePurchaseOrder, async () => {
            this.ViewWalletDisplay.updateStoreItems(
                await GetStore(this.StreamerID, -1),
                await GetPurchaseOrders(this.StreamerID));
        }))
    }

    private async LoadingStore() {
        let CoinsSettings: CoinsSettings = await GetCoinsSettings(this.StreamerID);
        if (CoinsSettings.FileNameOfCoinImage)
            this.ViewWalletDisplay.CoinImgURL = getUrlOfFile(this.StreamerID, 'CoinImage', CoinsSettings.FileNameOfCoinImage);

        let WalletOfUser: dbWallet = await GetWallet(this.StreamerID, this.TwitchUserID);
        this.ViewWalletDisplay.HTML_CoinsOfUserView.innerText = (~~WalletOfUser.Coins).toString();

        this.ViewWalletDisplay.CoinName = (await GetCoinsSettings(this.StreamerID)).CoinName;

        this.ViewWalletDisplay.updateStoreItems(
            await GetStore(this.StreamerID, -1),
            await GetPurchaseOrders(this.StreamerID));

        let WalletSkins = <WalletSkin[]>await getWalletSkins();

        let WalletSkinsSelectedName = window.localStorage['WalletSkinsSelectedName'];
        if (!WalletSkinsSelectedName) {
            WalletSkinsSelectedName = WalletSkins[0].Name;
            window.localStorage['WalletSkinsSelectedName'] = WalletSkinsSelectedName;
        }
        this.ViewWalletDisplay.setSkinOfWallet(WalletSkinsSelectedName, getURLOfWalletSkinsImg);
        this.setListeners();
    }

    constructor(Token: string, StreamerID: string, TwitchUserID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.ViewWalletDisplay = new ViewWalletDisplay();

        this.LoadingStore()
    }
}
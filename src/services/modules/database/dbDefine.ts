import { dbWallet, WalletDefiner } from "../../models/poll/dbWallet";
import { BettingsDefiner, dbBettings} from "../../models/poll/dbBettings";
import { SettingsDefiner, dbSettings } from "../../models/streamer_settings/dbSettings";
import { AccountData } from "../../models/AccountData";
import { ButtonDefiner, dbButton } from "../../models/poll/dbButton";
import { StoreDefiner, dbStore } from "../../models/store/dbStore";
import { dbPurchaseOrder, PurchaseOrdersDefiner } from "../../models/store/dbPurchaseOrders";
    /**
     * Loads and / or creates sequelize models by defining them
     */
export class Define {

    static async PurchaseOrder(AccountData: AccountData) {                
        AccountData.dbPurchaseOrders = <typeof dbPurchaseOrder> AccountData.dbStreamer
        .define(PurchaseOrdersDefiner.name, PurchaseOrdersDefiner.atributes, PurchaseOrdersDefiner.options);
        return AccountData.dbPurchaseOrders.sync();
    }

    static async Store(AccountData: AccountData) {                
        AccountData.dbStore = <typeof dbStore> AccountData.dbStreamer
        .define(StoreDefiner.name, StoreDefiner.atributes, StoreDefiner.options);
        return AccountData.dbStore.sync();
    }
    static async Settings(AccountData: AccountData) {
        AccountData.dbSettings = <typeof dbSettings> AccountData.dbStreamer
        .define(SettingsDefiner.name, SettingsDefiner.atributes, SettingsDefiner.options);
        return AccountData.dbSettings.sync();
    }
    
    static async Wallets(AccountData: AccountData) {
        AccountData.dbWallets = <typeof dbWallet> AccountData.dbStreamer
        .define(WalletDefiner.Name, WalletDefiner.atributes, WalletDefiner.options);
        return AccountData.dbWallets.sync();
    }
    
    static async CurrentPollButtons(AccountData: AccountData) {
         AccountData.dbCurrentPollButtons = <typeof dbButton> AccountData.dbStreamer
         .define(AccountData.CurrentPollID, ButtonDefiner.attributes, ButtonDefiner.options);
        return AccountData.dbCurrentPollButtons.sync();
    }
    static async CurrentBettings(AccountData: AccountData) {
        AccountData.dbCurrentBettings = <typeof dbBettings> AccountData.dbStreamer
        .define(AccountData.CurrentBettingsID, BettingsDefiner.atributes, BettingsDefiner.options);
        return AccountData.dbCurrentBettings.sync();
    }
}

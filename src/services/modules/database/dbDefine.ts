import { dbWallet, WalletDefiner } from "../../models/poll/dbWallet";
import { BettingDefiner, dbBet } from "../../models/poll/dbBetting";
import { SettingsDefiner, dbSettings } from "../../models/streamer_settings/dbSettings";
import { AccountData } from "../../models/dealer/AccountData";
import { ButtonDefiner, dbButton } from "../../models/poll/dbButton";
import { StoreDefiner, dbStoreItem } from "../../models/store/dbStoreItem";
import { dbPurchaseOrder, PurchaseOrdersDefiner } from "../../models/store/dbPurchaseOrders";
/**
 * Loads and / or creates sequelize models by defining them
 */
export class Define {
    static async PurchaseOrder(AccountData: AccountData) {
        AccountData.dbPurchaseOrders = <typeof dbPurchaseOrder>AccountData.dbStreamer
            .define(PurchaseOrdersDefiner.name, PurchaseOrdersDefiner.attributes, PurchaseOrdersDefiner.options);
        return AccountData.dbPurchaseOrders.sync();
    }

    static async Store(AccountData: AccountData) {
        AccountData.dbStore = <typeof dbStoreItem>AccountData.dbStreamer
            .define(StoreDefiner.name, StoreDefiner.attributes, StoreDefiner.options);
        return AccountData.dbStore.sync();
    }
    static async Settings(AccountData: AccountData) {
        AccountData.dbSettings = <typeof dbSettings>AccountData.dbStreamer
            .define(SettingsDefiner.name, SettingsDefiner.attributes, SettingsDefiner.options);
        return AccountData.dbSettings.sync();
    }

    static async Wallets(AccountData: AccountData) {
        AccountData.dbWallets = <typeof dbWallet>AccountData.dbStreamer
            .define(WalletDefiner.Name, WalletDefiner.attributes, WalletDefiner.options);
        return AccountData.dbWallets.sync();
    }

    static async CurrentPollButtons(AccountData: AccountData) {
        AccountData.dbCurrentPollButtons = <typeof dbButton>AccountData.dbStreamer
            .define(AccountData.CurrentPollID, ButtonDefiner.attributes, ButtonDefiner.options);
        return AccountData.dbCurrentPollButtons.sync();
    }
    static async CurrentBetting(AccountData: AccountData) {
        AccountData.dbCurrentBets = <typeof dbBet>AccountData.dbStreamer
            .define(AccountData.CurrentBettingID, BettingDefiner.attributes, BettingDefiner.options);
        return AccountData.dbCurrentBets.sync();
    }
}

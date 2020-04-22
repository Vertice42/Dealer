import { dbWallet, WalletDefiner } from "../../models/poll/dbWallet";
import { BettingDefiner, dbBet } from "../../models/poll/dbBets";
import { SettingsDefiner, dbSettings } from "../../models/streamer_settings/dbSettings";
import { AccountData } from "../../models/dealer/AccountData";
import { ButtonDefiner, dbPollButton } from "../../models/poll/dbButton";
import { StoreDefiner, dbStoreItem } from "../../models/store/dbStoreItem";
import { dbPurchaseOrder, PurchaseOrdersDefiner } from "../../models/store/dbPurchaseOrders";
import dbPollIndex, { Attributes, TableName } from "../../models/poll/dbPollIndex";
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
    static async dbButtons(AccountData: AccountData, PollID: number) {
        let dbButtons = <typeof dbPollButton>AccountData.dbStreamer
            .define('_poll_buttons_' + PollID, ButtonDefiner.attributes, ButtonDefiner.options);
        await dbButtons.sync();
        return dbButtons;
    }
    static async dbBets(AccountData: AccountData, PollID: number) {        
        let dbBets = <typeof dbBet>AccountData.dbStreamer
            .define('_bets_' + PollID, BettingDefiner.attributes, BettingDefiner.options);
        await dbBets.sync();
        return dbBets;
    }
    static async PollsIndex(AccountData: AccountData) {
        AccountData.PollsIndexes = <typeof dbPollIndex>AccountData.dbStreamer
            .define(TableName, Attributes, BettingDefiner.options);
        return AccountData.PollsIndexes.sync();
    }
}

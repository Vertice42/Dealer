import { dbWallet, WalletDefiner } from "../../models/poll/dbWallet";
import { BettingDefiner, dbBet } from "../../models/poll/dbBets";
import { SettingsDefiner, dbDealerSettings } from "../../models/streamer_settings/dbSettings";
import { AccountData } from "../../models/dealer/AccountData";
import { ButtonDefiner, dbPollButton } from "../../models/poll/dbButton";
import { StoreDefiner, dbStoreItem } from "../../models/store/dbStoreItem";
import { dbPurchaseOrder, PurchaseOrdersDefiner } from "../../models/store/dbPurchaseOrders";
import dbPollIndex, { PollIndexDefiner } from "../../models/poll/dbPollIndex";
import { dbDealer } from "./dbManager";
/**
 * Loads and / or creates sequelize models by defining them
 */
export class Define {
    static async PurchaseOrder(AccountData: AccountData) {
        AccountData.dbPurchaseOrders = <typeof dbPurchaseOrder>
        dbDealer.define(`${AccountData.StreamerID}_${PurchaseOrdersDefiner.name}`,
                PurchaseOrdersDefiner.attributes, PurchaseOrdersDefiner.options);
        return AccountData.dbPurchaseOrders.sync();
    }
    static async Store(AccountData: AccountData) {
        AccountData.dbStore = <typeof dbStoreItem>
        dbDealer.define(`${AccountData.StreamerID}_${StoreDefiner.name}`,
                StoreDefiner.attributes, StoreDefiner.options);
        return AccountData.dbStore.sync();
    }
    static async Settings(AccountData: AccountData) {
        AccountData.dbSettings = <typeof dbDealerSettings>
        dbDealer.define(`${AccountData.StreamerID}_${SettingsDefiner.name}`,
                SettingsDefiner.attributes, SettingsDefiner.options);
        return AccountData.dbSettings.sync();
    }
    static async Wallets(AccountData: AccountData) {
        AccountData.dbWallets = <typeof dbWallet>
        dbDealer.define(`${AccountData.StreamerID}_${WalletDefiner.name}`,
                WalletDefiner.attributes, WalletDefiner.options);
        return AccountData.dbWallets.sync();
    }
    static async dbButtons(AccountData: AccountData, PollID: number) {
        let dbButtons = <typeof dbPollButton>
        dbDealer.define(`${AccountData.StreamerID}_${PollID}_${ButtonDefiner.name}`,
                ButtonDefiner.attributes, ButtonDefiner.options);
        await dbButtons.sync();
        return dbButtons;
    }
    static async dbBets(AccountData: AccountData, PollID: number) {
        let dbBets = <typeof dbBet>
        dbDealer.define(`${AccountData.StreamerID}_${PollID}_${BettingDefiner.name}`,
                BettingDefiner.attributes, BettingDefiner.options);
        await dbBets.sync();
        return dbBets;
    }
    static async PollsIndex(AccountData: AccountData) {
        AccountData.dbPollsIndexes = <typeof dbPollIndex>
        dbDealer.define(`${AccountData.StreamerID}_${PollIndexDefiner.name}`,
                PollIndexDefiner.attributes, PollIndexDefiner.options);
        return AccountData.dbPollsIndexes.sync();
    }
}

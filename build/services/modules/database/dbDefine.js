"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbWallet_1 = require("../../models/poll/dbWallet");
const dbBettings_1 = require("../../models/poll/dbBettings");
const dbSettings_1 = require("../../models/streamer_settings/dbSettings");
const dbButton_1 = require("../../models/poll/dbButton");
const dbStore_1 = require("../../models/store/dbStore");
const dbPurchaseOrders_1 = require("../../models/store/dbPurchaseOrders");
/**
 * Loads and / or creates sequelize models by defining them
 */
class Define {
    static async PurchaseOrder(AccountData) {
        AccountData.dbPurchaseOrders = AccountData.dbStreamer
            .define(dbPurchaseOrders_1.PurchaseOrdersDefiner.name, dbPurchaseOrders_1.PurchaseOrdersDefiner.atributes, dbPurchaseOrders_1.PurchaseOrdersDefiner.options);
        return AccountData.dbPurchaseOrders.sync();
    }
    static async Store(AccountData) {
        AccountData.dbStore = AccountData.dbStreamer
            .define(dbStore_1.StoreDefiner.name, dbStore_1.StoreDefiner.atributes, dbStore_1.StoreDefiner.options);
        return AccountData.dbStore.sync();
    }
    static async Settings(AccountData) {
        AccountData.dbSettings = AccountData.dbStreamer
            .define(dbSettings_1.SettingsDefiner.name, dbSettings_1.SettingsDefiner.atributes, dbSettings_1.SettingsDefiner.options);
        return AccountData.dbSettings.sync();
    }
    static async Wallets(AccountData) {
        AccountData.dbWallets = AccountData.dbStreamer
            .define(dbWallet_1.WalletDefiner.Name, dbWallet_1.WalletDefiner.atributes, dbWallet_1.WalletDefiner.options);
        return AccountData.dbWallets.sync();
    }
    static async CurrentPollButtons(AccountData) {
        AccountData.dbCurrentPollButtons = AccountData.dbStreamer
            .define(AccountData.CurrentPollID, dbButton_1.ButtonDefiner.attributes, dbButton_1.ButtonDefiner.options);
        return AccountData.dbCurrentPollButtons.sync();
    }
    static async CurrentBettings(AccountData) {
        AccountData.dbCurrentBettings = AccountData.dbStreamer
            .define(AccountData.CurrentBettingsID, dbBettings_1.BettingsDefiner.atributes, dbBettings_1.BettingsDefiner.options);
        return AccountData.dbCurrentBettings.sync();
    }
}
exports.Define = Define;

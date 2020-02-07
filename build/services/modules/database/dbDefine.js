"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbWallet_1 = require("../../models/poll/dbWallet");
const dbBettings_1 = require("../../models/poll/dbBettings");
const dbSettings_1 = require("../../models/poll/dbSettings");
const dbButton_1 = require("../../models/poll/dbButton");
const dbFiles_1 = require("../../models/poll/dbFiles");
/**
 * Loads and / or creates sequelize models by defining them
 */
class Define {
    static Files(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbFiles = AccountData.dbStreamer
                .define(dbFiles_1.FilesDefiner.name, dbFiles_1.FilesDefiner.atributes, dbFiles_1.FilesDefiner.options);
            return AccountData.dbFiles.sync();
        });
    }
    static Settings(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbSettings = AccountData.dbStreamer
                .define(dbSettings_1.SettingsDefiner.name, dbSettings_1.SettingsDefiner.atributes, dbSettings_1.SettingsDefiner.options);
            return AccountData.dbSettings.sync();
        });
    }
    static Wallets(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbWallets = AccountData.dbStreamer
                .define(dbWallet_1.WalletDefiner.Name, dbWallet_1.WalletDefiner.atributes, dbWallet_1.WalletDefiner.options);
            return AccountData.dbWallets.sync();
        });
    }
    static CurrentPollButtons(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbCurrentPollButtons = AccountData.dbStreamer
                .define(AccountData.CurrentPollID, dbButton_1.ButtonDefiner.attributes, dbButton_1.ButtonDefiner.options);
            return AccountData.dbCurrentPollButtons.sync();
        });
    }
    static CurrentBettings(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbCurrentBettings = AccountData.dbStreamer
                .define(AccountData.CurrentBettingsID, dbBettings_1.BettingsDefiner.atributes, dbBettings_1.BettingsDefiner.options);
            return AccountData.dbCurrentBettings.sync();
        });
    }
}
exports.Define = Define;

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
const dbWishes_1 = require("../../models/poll/dbWishes");
const dbSettings_1 = require("../../models/poll/dbSettings");
const dbButton_1 = require("../../models/poll/dbButton");
class Define {
    static Settings(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbSettings = AccountData.dbStreamer.define(dbSettings_1.SettingsDefiner.name, dbSettings_1.SettingsDefiner.atributes, dbSettings_1.SettingsDefiner.options);
            return AccountData.dbSettings.sync();
        });
    }
    ;
    static Wallets(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbWallets = AccountData.dbStreamer.define(dbWallet_1.WalletDefiner.Name, dbWallet_1.WalletDefiner.atributes, dbWallet_1.WalletDefiner.options);
            return AccountData.dbWallets.sync();
        });
    }
    ;
    static CurrentPoll(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbCurrentPollButtons = AccountData.dbStreamer.define(AccountData.CurrentPollID, dbButton_1.ButtonDefiner.attributes, dbButton_1.ButtonDefiner.options);
            return AccountData.dbCurrentPollButtons.sync();
        });
    }
    static CurrentWishes(AccountData) {
        return __awaiter(this, void 0, void 0, function* () {
            AccountData.dbCurrentWishes = AccountData.dbStreamer.define(AccountData.CurrentWishesID, dbWishes_1.WishesDefiner.atributes, dbWishes_1.WishesDefiner.options);
            return AccountData.dbCurrentWishes.sync();
        });
    }
}
exports.Define = Define;

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
const bluebird_1 = require("bluebird");
const Streamer_1 = require("../database/Streamer");
function getAllWishes(StreamerID) {
    return Streamer_1.getAccountData(StreamerID).dbCurrentWishes.findAll();
}
exports.getAllWishes = getAllWishes;
function getBeatsOfCurrentPoll(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        let Wishes = yield getAllWishes(StreamerID);
        let Bets = [];
        Wishes.forEach(Wishe => {
            if (Bets[Wishe.Bet])
                Bets[Wishe.Bet]++;
            else
                Bets[Wishe.Bet] = 1;
        });
        return Bets;
    });
}
exports.getBeatsOfCurrentPoll = getBeatsOfCurrentPoll;
function getAllButtonsOfCurrentPoll(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return Streamer_1.getAccountData(StreamerID).dbCurrentPollButtons.findAll();
    });
}
exports.getAllButtonsOfCurrentPoll = getAllButtonsOfCurrentPoll;
function getButtonOfCurrentPoll(StreamerID, ButtonID) {
    return Streamer_1.getAccountData(StreamerID).dbCurrentPollButtons.findOne({ where: { ID: ButtonID } });
}
exports.getButtonOfCurrentPoll = getButtonOfCurrentPoll;
function CalculateDistribution(Wishes, WinningButtons) {
    let WageredCoins = 0;
    let LostWageredCoins = 0;
    Wishes.forEach(wishe => {
        if (wishe.BetAmount) {
            if (BetIsWinner(WinningButtons, wishe.Bet))
                WageredCoins += wishe.BetAmount;
            else
                LostWageredCoins += wishe.BetAmount;
        }
    });
    return { WageredCoins, LostWageredCoins, LossDistributor: LostWageredCoins / WageredCoins };
}
exports.CalculateDistribution = CalculateDistribution;
function UpdateButtonOfCurrentPoll(dbButton, newButton) {
    return __awaiter(this, void 0, void 0, function* () {
        return dbButton.update(newButton);
    });
}
function AddButtonOfCurrentPoll(StreamerID, Button) {
    return __awaiter(this, void 0, void 0, function* () {
        return Streamer_1.getAccountData(StreamerID).dbCurrentPollButtons.create(Button);
    });
}
function DeleteButtonOfCurrentPoll(StreamerID, ButtonID) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getButtonOfCurrentPoll(StreamerID, ButtonID)).destroy();
    });
}
function UpdateOrCreateButtonsOfPoll(StreamerID, Buttons) {
    return __awaiter(this, void 0, void 0, function* () {
        var CreatedButtons = 0;
        var UpdatedButtons = 0;
        let CreationAndUpdatePromises = [];
        for (const Button of Buttons) {
            let ButtonOfPoll = yield getButtonOfCurrentPoll(StreamerID, Button.ID);
            if (ButtonOfPoll) {
                CreationAndUpdatePromises.push(UpdateButtonOfCurrentPoll(ButtonOfPoll, Button));
                UpdatedButtons++;
            }
            else {
                CreationAndUpdatePromises.push(AddButtonOfCurrentPoll(StreamerID, Button));
                CreatedButtons++;
            }
        }
        yield Promise.all(CreationAndUpdatePromises);
        return bluebird_1.resolve({ CreatedButtons, UpdatedButtons });
    });
}
exports.UpdateOrCreateButtonsOfPoll = UpdateOrCreateButtonsOfPoll;
function DeleteButtonsThatAreNotIndb(StreamerID, buttons) {
    return __awaiter(this, void 0, void 0, function* () {
        const db_buttons = yield getAllButtonsOfCurrentPoll(StreamerID);
        let PromisesToDeleteButtons = [];
        for (let a = 0; a < db_buttons.length; a++) {
            let no_longer_exists_in_db = true;
            for (let b = 0; b < buttons.length; b++) {
                if (db_buttons[a].ID === buttons[b].ID) {
                    no_longer_exists_in_db = false;
                    db_buttons.splice(a, 1);
                    break;
                }
            }
            if (no_longer_exists_in_db)
                PromisesToDeleteButtons.push(DeleteButtonOfCurrentPoll(StreamerID, db_buttons[a].ID));
        }
        yield Promise.all(PromisesToDeleteButtons);
        return bluebird_1.resolve({ DeletedButtons: PromisesToDeleteButtons.length });
    });
}
exports.DeleteButtonsThatAreNotIndb = DeleteButtonsThatAreNotIndb;
function BetIsWinner(WinningButtons, Bet) {
    for (let i = 0; i < WinningButtons.length; i++) {
        if (WinningButtons[i].ID === Bet)
            return true;
    }
    return false;
}
exports.BetIsWinner = BetIsWinner;
function getWinningButtons(Buttons) {
    let WinningButtons = [];
    Buttons.forEach(Button => {
        if (Button.IsWinner)
            WinningButtons.push(Button);
    });
    return WinningButtons;
}
exports.getWinningButtons = getWinningButtons;

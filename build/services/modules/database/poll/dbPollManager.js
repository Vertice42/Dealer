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
const PollBeat_1 = require("../../../models/poll/PollBeat");
const dbStreamerManager_1 = require("../dbStreamerManager");
class dbPollMager {
    constructor(StreamerID) {
        this.StreamerID = StreamerID;
    }
    /**
     *
     * @returns {dbBettings[]}
     */
    getAllBettings() {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbCurrentBettings.findAll();
    }
    /**
     *
     * @returns {Bets: PollBeat[]}
     */
    getBeatsOfCurrentPoll() {
        return __awaiter(this, void 0, void 0, function* () {
            let Bettings = yield this.getAllBettings();
            let Bets = [];
            Bettings.forEach(Bettings => {
                if (Bets[Bettings.Bet])
                    Bets[Bettings.Bet].NumberOfBets++;
                else
                    Bets[Bettings.Bet] = new PollBeat_1.PollBeat(Bettings.Bet).setNumberOfBets(1);
            });
            return Bets;
        });
    }
    /**
     * @returns Promise<dbButton[]>
     */
    getAllButtonsOfCurrentPoll() {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.findAll();
    }
    /**
     *
     * @param ButtonID
     */
    getButtonOfCurrentPoll(ButtonID) {
        return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.findOne({ where: { ID: ButtonID } });
    }
    /**
     * Calculation of the distribution of winnings used in the list of bets and options
     * or options shipped
     *
     * @param Bettings
     * @param WinningButtons
     * @returns {
     * WageredCoins:number,
     * LostWageredCoins:number,
     * LossDistributor:number}
     *
     */
    static CalculateDistribution(Bettings, WinningButtons) {
        let WageredCoins = 0;
        let LostWageredCoins = 0;
        Bettings.forEach(Bettings => {
            if (Bettings.BetAmount) {
                if (dbPollMager.BetIsWinner(WinningButtons, Bettings.Bet))
                    WageredCoins += Bettings.BetAmount;
                else
                    LostWageredCoins += Bettings.BetAmount;
            }
        });
        return { WageredCoins, LostWageredCoins, LossDistributor: LostWageredCoins / WageredCoins };
    }
    /**
     *
     * @param dbButton
     * @param newButton
     */
    UpdateButtonOfCurrentPoll(dbButton, newButton) {
        return __awaiter(this, void 0, void 0, function* () {
            return dbButton.update(newButton);
        });
    }
    /**
     *
     * @param Button
     */
    AddButtonOfCurrentPoll(Button) {
        return __awaiter(this, void 0, void 0, function* () {
            return dbStreamerManager_1.dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.create(Button);
        });
    }
    /**
     *
     * @param ButtonID
     */
    DeleteButtonOfCurrentPoll(ButtonID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getButtonOfCurrentPoll(ButtonID)).destroy();
        });
    }
    /**
     *
     * @param Buttons: Array of PollButton
     * @returns { CreatedButtons:number, UpdatedButtons:number }
     */
    UpdateOrCreateButtonsOfPoll(Buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            var CreatedButtons = 0;
            var UpdatedButtons = 0;
            let CreationAndUpdatePromises = [];
            for (const Button of Buttons) {
                let ButtonOfPoll = yield this.getButtonOfCurrentPoll(Button.ID);
                if (ButtonOfPoll) {
                    CreationAndUpdatePromises.push(this.UpdateButtonOfCurrentPoll(ButtonOfPoll, Button));
                    UpdatedButtons++;
                }
                else {
                    CreationAndUpdatePromises.push(this.AddButtonOfCurrentPoll(Button));
                    CreatedButtons++;
                }
            }
            yield Promise.all(CreationAndUpdatePromises);
            return bluebird_1.resolve({ CreatedButtons, UpdatedButtons });
        });
    }
    /**
     * The buttons that exist in the array given to the parameter but do not exist in the database
     * are deleted, if the array is empty nothing is deleted.
     * @param buttons:PollButton[]
     */
    DeleteButtonsThatAreNotIndb(buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            const db_buttons = yield this.getAllButtonsOfCurrentPoll();
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
                    PromisesToDeleteButtons.push(this.DeleteButtonOfCurrentPoll(db_buttons[a].ID));
            }
            yield Promise.all(PromisesToDeleteButtons);
            return bluebird_1.resolve({ DeletedButtons: PromisesToDeleteButtons.length });
        });
    }
    /**
     * Determines whether the bet is a winner, for which the button array works to contain
     * only winning options or options
     *
     * @param WinningButtons
     * @param Bet
     *
     * @returns boolean
     */
    static BetIsWinner(WinningButtons, Bet) {
        for (let i = 0; i < WinningButtons.length; i++)
            if (WinningButtons[i].ID === Bet)
                return true;
        return false;
    }
    /**
     *
     * @param Buttons
     */
    static getWinningButtons(Buttons) {
        let WinningButtons = [];
        Buttons.forEach(Button => {
            if (Button.IsWinner)
                WinningButtons.push(Button);
        });
        return WinningButtons;
    }
}
exports.dbPollMager = dbPollMager;

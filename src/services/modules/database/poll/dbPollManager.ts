import { resolve } from "bluebird";
import { Bettings } from "../../../models/poll/Bettings";
import { PollButton } from "../../../models/poll/PollButton";
import { PollBeat } from "../../../models/poll/PollBeat"
import { dbButton, dbButtonType } from "../../../models/poll/dbButton";
import { dbStreamerManager } from "../dbStreamerManager";
import { sleep } from "../../../../utils/utils";

export class dbPollMager {
    StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    /**
     * 
     * @returns {dbBettings[]}
     */
    getAllBettings() {
        return dbStreamerManager.getAccountData(this.StreamerID).dbCurrentBettings.findAll();
    }

    /**
     * 
     * @returns {Bets: PollBeat[]}
     */
    async getBeatsOfCurrentPoll() {
        let Bettings = await this.getAllBettings();
        let Bets: PollBeat[] = [];
        Bettings.forEach(Bettings => {
            if (Bets[Bettings.Bet])
                Bets[Bettings.Bet].NumberOfBets++;
            else
                Bets[Bettings.Bet] = new PollBeat(Bettings.Bet).setNumberOfBets(1);
        });
        return Bets;
    }

    /**
     * @returns Promise<dbButton[]>
     */
    async getAllButtonsOfCurrentPoll() {
        return dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.findAll()
            .catch(async (rej) => {
                if (rej.parent.errno === 1146) {
                    await sleep(500)
                    return this.getAllButtonsOfCurrentPoll();
                    //TODO POSIVEL LOOP INFINITO
                }
            })
    }

    /**
     * 
     * @param ButtonID 
     */
    getButtonOfCurrentPoll(ButtonID: number) {
        return dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.findOne({ where: { ID: ButtonID } });
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
    static CalculateDistribution(Bettings: Bettings[], WinningButtons: PollButton[]): any {
        let WageredCoins: number = 0;
        let LostWageredCoins: number = 0;

        Bettings.forEach(Bettings => {
            if (Bettings.BetAmount) {
                if (dbPollMager.BetIsWinner(WinningButtons, Bettings.Bet))
                    WageredCoins += Bettings.BetAmount;
                else
                    LostWageredCoins += Bettings.BetAmount;
            }
        });

        return { WageredCoins, LostWageredCoins, LossDistributor: LostWageredCoins / WageredCoins }
    }

    /**
     * 
     * @param dbButton 
     * @param newButton 
     */
    async UpdateButtonOfCurrentPoll(dbButton: dbButton, newButton: dbButtonType) {
        return dbButton.update(newButton);
    }
    /**
     * 
     * @param Button 
     */
    async AddButtonOfCurrentPoll(Button: dbButtonType) {
        return dbStreamerManager.getAccountData(this.StreamerID).dbCurrentPollButtons.create(Button);
    }
    /**
     * 
     * @param ButtonID 
     */
    async DeleteButtonOfCurrentPoll(ButtonID: number) {
        return (await this.getButtonOfCurrentPoll(ButtonID)).destroy();
    }

    /**
     * 
     * @param Buttons: Array of PollButton
     * @returns { CreatedButtons:number, UpdatedButtons:number }
     */
    async UpdateOrCreateButtonsOfPoll(Buttons: PollButton[]) {
        var CreatedButtons = 0;
        var UpdatedButtons = 0;
        let CreationAndUpdatePromises = [];

        for (const Button of Buttons) {
            let ButtonOfPoll = await this.getButtonOfCurrentPoll(Button.ID);

            if (ButtonOfPoll) {
                CreationAndUpdatePromises.push(this.UpdateButtonOfCurrentPoll(ButtonOfPoll, Button))
                UpdatedButtons++;
            } else {
                CreationAndUpdatePromises.push(this.AddButtonOfCurrentPoll(Button))
                CreatedButtons++;
            }
        }

        await Promise.all(CreationAndUpdatePromises);

        return resolve({ CreatedButtons, UpdatedButtons })
    }

    /**
     * The buttons that exist in the array given to the parameter but do not exist in the database
     * are deleted, if the array is empty nothing is deleted.
     * @param buttons:PollButton[]
     */
    async DeleteButtonsThatAreNotIndb(buttons: PollButton[]) {
        const db_buttons = await this.getAllButtonsOfCurrentPoll();

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
        await Promise.all(PromisesToDeleteButtons);
        return resolve({ DeletedButtons: PromisesToDeleteButtons.length });
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
    static BetIsWinner(WinningButtons: PollButton[], Bet: number) {
        for (let i = 0; i < WinningButtons.length; i++)
            if (WinningButtons[i].ID === Bet) return true;

        return false;
    }

    /**
     * 
     * @param Buttons 
     */
    static getWinningButtons(Buttons: PollButton[]) {
        let WinningButtons = [];
        Buttons.forEach(Button => {
            if (Button.IsWinner)
                WinningButtons.push(Button);
        });
        return WinningButtons;
    }
}
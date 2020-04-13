import { resolve, reject } from "bluebird";
import { PollButton } from "../../../models/poll/PollButton";
import { PollBeat } from "../../../models/poll/PollBeat"
import { dbButton, dbButtonType } from "../../../models/poll/dbButton";
import { dbManager } from "../dbManager";
import { Bet } from "../../../models/poll/dbBetting";
import { sleep } from "../../../../utils/functions";

export class dbPollManager {
    StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    /**
     * 
     * @returns {dbBeatings[]}
     */
    getAllBeatings() {
        if (!dbManager.getAccountData(this.StreamerID).dbCurrentBeatings)
            return [];

        return dbManager.getAccountData(this.StreamerID).dbCurrentBeatings.findAll();
    }

    /**
     * 
     * @returns {Bets: PollBeat[]}
     */
    async getBeatsOfCurrentPoll() {
        let Beatings = await this.getAllBeatings();
        let Bets: PollBeat[] = [];
        Beatings.forEach(Beatings => {
            if (Bets[Beatings.Bet])
                Bets[Beatings.Bet].NumberOfBets++;
            else
                Bets[Beatings.Bet] = new PollBeat(Beatings.Bet).setNumberOfBets(1);
        });
        return Bets;
    }

    /**
     * @returns Promise<dbButton[]>
     */
    async getAllButtonsOfCurrentPoll() {

        let AccountData = dbManager.getAccountData(this.StreamerID);

        if (AccountData) {
            if (AccountData.dbCurrentPollButtons) {
                return AccountData.dbCurrentPollButtons.findAll()
                    .catch(async (rej) => {
                        if (rej.parent.errno === 1146) {
                            await sleep(500)
                            return this.getAllButtonsOfCurrentPoll();
                        }
                    })
            }
            return [];
        }
        return reject('AccountData undefined');
    }

    /**
     * 
     * @param ButtonID 
     */
    getButtonOfCurrentPoll(ButtonID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);

        if (AccountData) {
            if (AccountData.dbCurrentPollButtons) {
                return AccountData.dbCurrentPollButtons.findOne({ where: { ID: ButtonID } });
            }
            return reject('dbCurrentPollButtons undefined');

        }
        return reject('AccountData undefined');
    }

    /**
     * Calculation of the distribution of winnings used in the list of bets and options
     * or options shipped
     * 
     * @param Beatings 
     * @param WinningButtons 
     * @returns {
     * WageredCoins:number, 
     * LostWageredCoins:number, 
     * LossDistributor:number}
     * 
     */
    static CalculateDistribution(Beatings: Bet[], WinningButtons: PollButton[]): any {
        let WageredCoins: number = 0;
        let LostWageredCoins: number = 0;

        Beatings.forEach(Beatings => {
            if (Beatings.BetAmount) {
                if (dbPollManager.BetIsWinner(WinningButtons, Beatings.Bet))
                    WageredCoins += Beatings.BetAmount;
                else
                    LostWageredCoins += Beatings.BetAmount;
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
        return dbManager.getAccountData(this.StreamerID).dbCurrentPollButtons.create(Button);
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
    async DeleteButtonsThatAreNotIn_db(buttons: PollButton[]) {
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
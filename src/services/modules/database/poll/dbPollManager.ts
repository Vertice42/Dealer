import { resolve, reject } from "bluebird";
import { PollButton } from "../../../models/poll/PollButton";
import { dbButton, dbButtonType } from "../../../models/poll/dbButton";
import { dbManager } from "../dbManager";
import { Bet, dbBet } from "../../../models/poll/dbBetting";
import { sleep } from "../../../../utils/functions";
import { PollBet } from "../../../models/poll/PollBeat";

export class dbPollManager {
    StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    async getAllBets(): Promise<dbBet[]> {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        await AccountData.DefinitionFinish;

        if (!AccountData.dbCurrentBets) return [];
        return AccountData.dbCurrentBets.findAll();
    }

    async getBetsOfCurrentPoll(): Promise<PollBet[]> {
        let dbBets = await this.getAllBets();
        let Bets: PollBet[] = [];
        dbBets.forEach(Bets => {
            if (Bets[Bets.Bet])
                Bets[Bets.Bet].NumberOfBets++;
            else
                Bets[Bets.Bet] = new PollBet(Bets.Bet).setNumberOfBets(1);
        });
        return Bets;
    }

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
    async getButtonOfCurrentPoll(ButtonID: number) {
        let AccountData = dbManager.getAccountData(this.StreamerID);
        await AccountData.DefinitionFinish;

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
     * @param Bets 
     * @param WinningButtons 
     * @returns {
     * WageredCoins:number, 
     * LostWageredCoins:number, 
     * LossDistributor:number}
     * 
     */
    static CalculateDistribution(Bets: Bet[], WinningButtons: PollButton[]): any {
        let WageredCoins: number = 0;
        let LostWageredCoins: number = 0;

        Bets.forEach(Bets => {
            if (Bets.BetAmount) {
                if (dbPollManager.BetIsWinner(WinningButtons, Bets.Bet))
                    WageredCoins += Bets.BetAmount;
                else
                    LostWageredCoins += Bets.BetAmount;
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
     * @param Buttons: Array of PollButton
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
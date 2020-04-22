import { resolve, reject } from "bluebird";
import { PollButton } from "../../../models/poll/PollButton";
import { dbPollButton, dbButtonType } from "../../../models/poll/dbButton";
import { dbManager } from "../dbManager";
import { PollBet } from "../../../models/poll/PollBeat";
import { PollStatus } from "../../../models/poll/PollStatus";
import { dbBet, Bet } from "../../../models/poll/dbBets";
import { Define } from "../dbDefine";
import { AccountData } from "../../../models/dealer/AccountData";
import { getMaxIDOfTable } from "../dbUtil";

export class dbPollManager {
    AccountData: AccountData;

    async get_dbButtons(): Promise<typeof dbPollButton> {
        if (!this.AccountData.dbButtons) this.AccountData.dbButtons = await Define.dbButtons(this.AccountData, await this.getIdOfLastPollID());
        return this.AccountData.dbButtons;
    }

    async get_dbBets(): Promise<typeof dbBet> {
        if (!this.AccountData.dbBets) this.AccountData.dbBets = await Define.dbBets(this.AccountData, await this.getIdOfLastPollID());
        return this.AccountData.dbBets;
    }

    async getLastPollStatus() {
        if (!this.AccountData.LastPollStatus)
            this.AccountData.LastPollStatus = await this.getPollStatus(await this.getIdOfLastPollID());

        return this.AccountData.LastPollStatus;
    }
    async getPollStatusOf_db(IdOfPollIndex: number) {
        return (await this.AccountData.PollsIndexes.findOne({ where: { id: IdOfPollIndex } }));
    }

    async createPollIndex(PollIndex: PollStatus) {
        this.AccountData.LastPollStatus = undefined;
        this.AccountData.dbBets = undefined;
        this.AccountData.dbButtons = undefined;

        this.AccountData.LastPollID++;
        this.AccountData.dbBets = undefined

        await this.AccountData.PollsIndexes.create(PollIndex);
    }
    async updatePollStatus(PollStatus: PollStatus) {
        this.AccountData.LastPollStatus = undefined;
        
        return (await this.getPollStatusOf_db(PollStatus.id||this.AccountData.LastPollID)).update(PollStatus);
    }
    async getPollStatus(IdOfPollIndex: number) {
        let dbPollStatus = await this.getPollStatusOf_db(IdOfPollIndex);
        return (dbPollStatus) ? new PollStatus(dbPollStatus) : new PollStatus().wax();
    }

    async getIdOfLastPollID(): Promise<number> {
        if (!this.AccountData.LastPollID) {
            this.AccountData.LastPollID = await getMaxIDOfTable(this.AccountData.PollsIndexes);
        }
        return this.AccountData.LastPollID;
    }

    async getAllBets(): Promise<dbBet[]> {
        return (await this.get_dbBets()).findAll();
    }

    async getNumberOfBets(): Promise<PollBet[]> {
        let dbBets = await this.getAllBets();

        let Bets: PollBet[] = [];
        dbBets.forEach(dbBet => {
            if (Bets[dbBet.Bet])
                Bets[dbBet.Bet].NumberOfBets++;
            else
                Bets[dbBet.Bet] = new PollBet(dbBet.Bet, 1);
        });
        return Bets;
    }

    async getAllButtonsOfCurrentPoll() {
        return (await this.get_dbButtons()).findAll();
    }

    /**
     * 
     * @param ButtonID 
     */
    async getButtonOfCurrentPoll(ButtonID: number) {
        return (await this.get_dbButtons()).findOne({ where: { ID: ButtonID } })
    }

    /**
     * 
     * @param dbButton 
     * @param newButton 
     */
    async UpdateButtonOfCurrentPoll(dbButton: dbPollButton, newButton: dbButtonType) {
        return dbButton.update(newButton);
    }

    async AddButtonOfCurrentPoll(new_Button: PollButton) {
        return (await this.get_dbButtons()).create(new_Button);
    }

    async DeleteButtonOfCurrentPoll(ButtonID: number) {
        return (await this.getButtonOfCurrentPoll(ButtonID)).destroy();
    }

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

    async get_dbBet(TwitchUserID: string) {
        return (await this.get_dbBets()).findOne({ where: { TwitchUserID: TwitchUserID } });
    }

    async updateBet(dbBet: dbBet, newBet: Bet) {
        return dbBet.update(newBet);
    }

    async createBet(newBet: Bet) {
        return (await this.get_dbBets()).create(newBet);
    }
    constructor(StreamerID: string) {
        this.AccountData = dbManager.getAccountData(StreamerID);
    }
}
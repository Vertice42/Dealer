import { dbManager } from "../dbManager";
import { dbBet, Bet } from "../../../models/poll/dbBettings";

export class dbBettingsManager {
    private StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    async getAllBets(){
        return dbManager.getAccountData(this.StreamerID).dbCurrentBettings
        .findAll();
    }

    async getdbBet(TwitchUserID: string) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBettings
            .findOne({ where: { TwitchUserID: TwitchUserID } });
    }

    async updateBet(dbBet: dbBet, newBeat: Bet) {
        return dbBet.update(newBeat);
    }

    async createBet(newBet: Bet) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBettings
            .create(newBet);
    }
}
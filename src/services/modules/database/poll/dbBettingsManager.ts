import { dbManager } from "../dbManager";
import { dbBet, Bet } from "../../../models/poll/dbBetting";

export class dbBeatingsManager {
    private StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    async getAllBets(){
        return dbManager.getAccountData(this.StreamerID).dbCurrentBeatings
        .findAll();
    }

    async get_dbBet(TwitchUserID: string) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBeatings
            .findOne({ where: { TwitchUserID: TwitchUserID } });
    }

    async updateBet(dbBet: dbBet, newBeat: Bet) {
        return dbBet.update(newBeat);
    }

    async createBet(newBet: Bet) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBeatings
            .create(newBet);
    }
}
import { dbManager } from "../dbManager";
import { dbBet, Bet } from "../../../models/poll/dbBetting";

export class dbBetsManager {
    private StreamerID: string;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }

    async getAllBets(){
        return dbManager.getAccountData(this.StreamerID).dbCurrentBets
        .findAll();
    }

    async get_dbBet(TwitchUserID: string) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBets
            .findOne({ where: { TwitchUserID: TwitchUserID } });
    }

    async updateBet(dbBet: dbBet, newBet: Bet) {
        return dbBet.update(newBet);
    }

    async createBet(newBet: Bet) {
        return dbManager.getAccountData(this.StreamerID).dbCurrentBets
            .create(newBet);
    }
}
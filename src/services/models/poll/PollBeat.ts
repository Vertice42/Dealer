export class PollBet {
    BetID: number;
    NumberOfBets: number;
    constructor(BetID: number,NumberOfBets = 0) {
        this.BetID = BetID;
        this.NumberOfBets = NumberOfBets;
    }
}
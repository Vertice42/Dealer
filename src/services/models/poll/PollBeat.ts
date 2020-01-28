export class PollBeat {
    BetID: number;
    NumberOfBets: number;
    constructor(BetID: number) {
        this.BetID = BetID;
    }

    setNumberOfBets(NumberOfBets: number) {
        this.NumberOfBets = NumberOfBets;
        return this;
    }
}
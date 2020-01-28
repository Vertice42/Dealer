"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PollBeat {
    constructor(BetID) {
        this.BetID = BetID;
    }
    setNumberOfBets(NumberOfBets) {
        this.NumberOfBets = NumberOfBets;
        return this;
    }
}
exports.PollBeat = PollBeat;

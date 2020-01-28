"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Poll {
    constructor(PollStatus, PollButtons, LossDistributorOfPoll, LastUpdate, Votes) {
        this.PollStatus = PollStatus;
        this.PollButtons = PollButtons;
        this.LossDistributorOfPoll = LossDistributorOfPoll;
        this.LastUpdate = LastUpdate;
        this.Votes = Votes;
    }
}
exports.Poll = Poll;

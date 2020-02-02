import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
import { PollBeat } from "./PollBeat";
export class Poll {
    PollStatus: PollStatus;
    PollButtons: PollButton[];
    LossDistributorOfPoll: number;
    LastUpdate: number;
    Bets: PollBeat[];
    constructor(PollStatus: PollStatus, PollButtons: PollButton[], LossDistributorOfPoll: number, LastUpdate: number, Votes) {
        this.PollStatus = PollStatus;
        this.PollButtons = PollButtons;
        this.LossDistributorOfPoll = LossDistributorOfPoll;
        this.LastUpdate = LastUpdate;
        this.Bets = Votes;
    }
}
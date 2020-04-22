import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
import { PollBet } from "./PollBeat";
export class Poll {
    PollStatus: PollStatus;
    PollButtons: PollButton[];
    LastUpdate: number;
    Bets: PollBet[];
    constructor(PollStatus: PollStatus, PollButtons: PollButton[], LastUpdate: number, Votes) {
        this.PollStatus = PollStatus;
        this.PollButtons = PollButtons;
        this.LastUpdate = LastUpdate;
        this.Bets = Votes;
    }
}

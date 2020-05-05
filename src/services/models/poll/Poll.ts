import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
import { PollBet } from "./PollBeat";
export class Poll {
    PollStatus: PollStatus;
    PollButtons: PollButton[];
    Bets: PollBet[];
    constructor(PollStatus: PollStatus, PollButtons: PollButton[],Bets: PollBet[]) {
        this.PollStatus = PollStatus;
        this.PollButtons = PollButtons;
        this.Bets = Bets;
    }
}

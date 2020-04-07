import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
export class PollRequest {
    Token: string;
    NewPollStatus: PollStatus;
    PollButtons: PollButton[];

    constructor(Token: string, PollButtons: PollButton[], NewPollStatus: PollStatus) {
        this.Token = Token;
        this.PollButtons = PollButtons;
        this.NewPollStatus = NewPollStatus;
    }
}

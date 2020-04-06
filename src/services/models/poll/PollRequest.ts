import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
export class PollRequest {
    StreamerID: string;
    NewPollStatus: PollStatus;
    PollButtons: PollButton[];

    constructor(StreamerID: string, PollButtons: PollButton[], NewPollStatus: PollStatus) {
        this.StreamerID = StreamerID;
        this.PollButtons = PollButtons;
        this.NewPollStatus = NewPollStatus;
    }
}

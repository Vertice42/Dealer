import { PollButton } from "./PollButton";
import { PollStatus } from "./PollStatus";
export class PollRequest {
    body: {
        StreamerID: any;
        NewPollStatus: PollStatus;
        PollButtons: PollButton[];
    };
}

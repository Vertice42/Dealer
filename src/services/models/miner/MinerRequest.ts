export class MinerRequest {
    StreamerID: string;
    TwitchUserID: string;

    constructor(StreamerID: string, TwitchUserID: string) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
    }
}

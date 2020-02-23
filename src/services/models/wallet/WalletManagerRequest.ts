export class WalletManagerRequest {
    StreamerID: string;
    TwitchUserID: string;
    newValue: number;

    constructor(StreamerID: string,TwitchUserID: string,newValue: number) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.newValue = newValue;
    }
}

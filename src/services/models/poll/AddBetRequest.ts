export class AddBetRequest {
    body: {
        StreamerID: string;
        TwitchUserID: string;
        BetAmount: number;
        Vote: number;
    };
}

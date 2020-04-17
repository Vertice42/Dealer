export class AddBetRequest {
    Token: string;
    TwitchUserName: string;
    BetAmount: number;
    Vote: number;
    constructor(Token: string, TwitchUserName: string, Vote: number, BetAmount: number) {
        this.Token = Token;
        this.TwitchUserName = TwitchUserName;
        this.BetAmount = BetAmount;
        this.Vote = Vote;
    }
}

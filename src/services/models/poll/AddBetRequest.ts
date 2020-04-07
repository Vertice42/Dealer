export class AddBetRequest {
    Token: string;
    TwitchUserName: string;
    BetAmount: number;
    Vote: number;
    constructor(Token: string, TwitchUserName: string, BetAmount: number, Vote: number) {
        this.Token = Token;
        this.TwitchUserName = TwitchUserName;
        this.BetAmount = BetAmount;
        this.Vote = Vote;
    }
}

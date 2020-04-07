export class WalletManagerRequest {
    Token: string;
    TwitchUserID: string;
    newValue: number;

    constructor(Token: string,TwitchUserID: string,newValue: number) {
        this.Token = Token;
        this.TwitchUserID = TwitchUserID;
        this.newValue = newValue;
    }
}

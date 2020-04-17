export class UpdateProductsPurchasedByUserRequest {
    Token: string;
    Transaction: TwitchExtBitsTransaction;

    constructor(Token: string, Transaction: TwitchExtBitsTransaction) {
        this.Token = Token;
        this.Transaction = Transaction;
    }
}
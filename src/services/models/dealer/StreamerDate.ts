export default class TransactionsOfUser {
    ID: string;
    TransactionsArray: TwitchExtBitsTransaction[];
    TransactionsArrayJson: string;

    constructor(ID: string, TransactionsOfUser: TwitchExtBitsTransaction[]) {
        this.ID = ID;
        this.TransactionsArray = TransactionsOfUser;
    }
}
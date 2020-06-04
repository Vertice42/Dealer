export default class TransactionsOfUser {
    ID: string;
    TransactionsArray: any;

    constructor(ID: string, TransactionsOfUser: TwitchExtBitsTransaction[]) {
        this.ID = ID;
        this.TransactionsArray = TransactionsOfUser;
    }
}
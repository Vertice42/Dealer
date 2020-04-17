export default class TransactionsOfUser {
    ID: string;
    TransactionsArray: TwitchExtBitsTransaction[];
    constructor(ID: string, TransactionsOfUser: TwitchExtBitsTransaction[]) {
        this.ID = ID;
        this.TransactionsArray = TransactionsOfUser;
    }
}
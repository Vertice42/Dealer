export class PollButton {
    ID: number;
    Name: string;
    Color: string;
    IsWinner: boolean;
    Votes: number;
    constructor(id: number, name: string, color: string, IsWinner: boolean) {
        this.ID = id;
        this.Name = name;
        this.Color = color;
        this.IsWinner = IsWinner;
    }
}

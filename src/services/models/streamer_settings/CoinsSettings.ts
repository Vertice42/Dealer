export class CoinsSettings {
    CoinName: string
    FileNameOfCoinImage: string

    constructor(CoinName?: string,FileNameOfCoinImage?: string){
        this.CoinName = CoinName;
        this.FileNameOfCoinImage = FileNameOfCoinImage;
    }
}
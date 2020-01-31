import { MiningResult } from "../../../services/models/miner/MiningResult";
import GameBoard from "../../video_overlay/View"
import { MineCoin } from "../../BackendConnection";

export class Miner {

    StreamerID: string;
    TwitchUserID: string;
    CoinsOfUser:number;

    constructor(StreamerID: string, TwitchUserID: string, CoinsOfUser) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.CoinsOfUser = CoinsOfUser;
    }
    private onSuccessfullyMined(MiningResponse: MiningResult) {
        let diference = ~~MiningResponse.CoinsOfUser - this.CoinsOfUser;

        if (diference > 0) {
            GameBoard.startDepositAnimation(~~diference + 1);
        }
        else {
            if (diference <= -1) {
                GameBoard.startWithdrawalAnimation((~~diference + 1) * -1);
            }
        }
        this.CoinsOfUser = MiningResponse.CoinsOfUser;
        GameBoard.CoinsOfUserView.innerText = (~~this.CoinsOfUser).toString();

        setTimeout(() => {
            this.TryToMine()
        }, 1000);
    }

    async TryToMine() {
        return MineCoin(this.StreamerID, this.TwitchUserID)
            .then((res) => {
                this.onSuccessfullyMined(res);
            })
            .catch((error) => {
                console.log('Error connecting to Mine Service, next attempt in 3s');
                setTimeout(() => {
                    this.TryToMine();
                }, 3000);
            })
    }
}
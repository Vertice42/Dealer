import { MiningResponse } from "../../../services/models/miner/MiningResponse";
import { MineCoin } from "../../BackendConnection";

export class Miner {

    StreamerID: string;
    TwitchUserID: string;
    CoinsOfUser = 0;
    onMine: (arg0: number, arg1: number) => void

    constructor(StreamerID: string, TwitchUserID: string, onSuccess = (arg0: number, arg1: number) => {}) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.onMine = onSuccess;
    }
    private onSuccessfullyMined(MiningResponse: MiningResponse) {
        let CoinsAddedOrSubtracted = ~~MiningResponse.CoinsOfUser - this.CoinsOfUser;
        this.CoinsOfUser = MiningResponse.CoinsOfUser;

        this.onMine(this.CoinsOfUser, CoinsAddedOrSubtracted);
        setTimeout(() => { this.TryToMine() }, MiningResponse.MinimumTimeToMine);
    }

    private TryToMine() {
        MineCoin(this.StreamerID, this.TwitchUserID)
            .then((res) => {
                this.onSuccessfullyMined(res);
            })
            .catch((error) => {
                console.log('Error connecting to Mine Service, next attempt in 3s', error);
                setTimeout(() => {
                    this.TryToMine();
                }, 3000);
            })
    }
    startMining() {
        this.TryToMine()
    }
}
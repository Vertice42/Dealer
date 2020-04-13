import { MiningResponse } from "../../../services/models/miner/MiningResponse";
import { MineCoin } from "../../common/BackendConnection/Miner";
import { MinerRequest } from "../../../services/models/miner/MinerRequest";
import { GetWallet } from "../../common/BackendConnection/Wallets";

/**
 * It is intended to mine coins for the user, 
 * which are only valid in the channel where the extension is
 */
export class Miner {
    private StreamerID: string;
    private TwitchUserID: string;
    private CoinsOfUser = 0;
    private stop = false;
    private onStop = ()=> {};
    private _onMine: (CoinsOfUser: number, CoinsAddedOrSubtracted: number) => any;
    
    private onSuccessfullyMined(MiningResponse: MiningResponse) {
        let CoinsAddedOrSubtracted = ~~MiningResponse.CoinsOfUser - this.CoinsOfUser;
        this.CoinsOfUser = MiningResponse.CoinsOfUser;

        this._onMine(this.CoinsOfUser, CoinsAddedOrSubtracted);
        setTimeout(() => { this.TryToMine() }, MiningResponse.MinimumTimeToMine);

        if(this.stop) this.onStop();
    }

    private TryToMine() {
        MineCoin(new MinerRequest(this.StreamerID, this.TwitchUserID))
            .then((res) => {
                this.onSuccessfullyMined(res);
            })
            .catch((error) => {
                console.error('Error connecting to Mine Service, next attempt in 3s', error);
                setTimeout(() => {
                    this.TryToMine();
                }, 3000);
            })
    }

    /**
     * Is fired every time the mining was successful, 
     * if there is a failure a new attempt will take place in 3000ms
     */
    public set onMine(_onMine:(CoinsOfUser: number, CoinsAddedOrSubtracted: number) => any){
        this._onMine = _onMine;
    }

    public async startMining() {
        this.stop = false;
        this.CoinsOfUser =  (await GetWallet(this.StreamerID, this.TwitchUserID)).Coins;
        this.TryToMine();
    }
    
    public async stopMining() {
        this.stop = true;
        return new Promise((resolve)=> this.onStop = () => resolve());
    }
    
    constructor(StreamerID: string, TwitchUserID: string, onSuccess = (CoinsOfUser: number, CoinsAddedOrSubtracted: number) => { }) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this._onMine = onSuccess;

        
    }
}
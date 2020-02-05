"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BackendConnection_1 = require("../../BackendConnection");
class Miner {
    constructor(StreamerID, TwitchUserID, CoinsOfUser, onSuccess) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.CoinsOfUser = CoinsOfUser;
        this.onSuccess = onSuccess;
    }
    onSuccessfullyMined(MiningResponse) {
        let CoinsAddedOrSubtracted = ~~MiningResponse.CoinsOfUser - this.CoinsOfUser;
        this.CoinsOfUser = MiningResponse.CoinsOfUser;
        this.onSuccess(this.CoinsOfUser, CoinsAddedOrSubtracted);
        setTimeout(() => { this.TryToMine(); }, MiningResponse.MinimumTimeToMine);
    }
    TryToMine() {
        BackendConnection_1.MineCoin(this.StreamerID, this.TwitchUserID)
            .then((res) => {
            this.onSuccessfullyMined(res);
        })
            .catch((error) => {
            console.log(error);
            console.log('Error connecting to Mine Service, next attempt in 3s');
            setTimeout(() => {
                this.TryToMine();
            }, 3000);
        });
    }
    startMining() {
        this.TryToMine();
    }
}
exports.Miner = Miner;

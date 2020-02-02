"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiningResponse {
    constructor(TimeBetweenLastMiningAttemptAndNow, CoinsOfUser, MinimumTimeToMine) {
        this.TimeBetweenLastMiningAttemptAndNow = TimeBetweenLastMiningAttemptAndNow;
        this.CoinsOfUser = CoinsOfUser;
        this.MinimumTimeToMine = MinimumTimeToMine;
    }
}
exports.MiningResponse = MiningResponse;

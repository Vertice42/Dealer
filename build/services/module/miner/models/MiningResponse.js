"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiningResponse {
    constructor(TimeBetweenLastMiningAttemptAndNow, CoinsOfUser) {
        this.TimeBetweenLastMiningAttemptAndNow = TimeBetweenLastMiningAttemptAndNow;
        this.CoinsOfUser = CoinsOfUser;
    }
}
exports.MiningResponse = MiningResponse;

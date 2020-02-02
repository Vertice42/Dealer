export class MiningResponse {
    TimeBetweenLastMiningAttemptAndNow: number;
    CoinsOfUser: number;
    MinimumTimeToMine: number;
    constructor(TimeBetweenLastMiningAttemptAndNow: number, CoinsOfUser: number,MinimumTimeToMine: number) {
        this.TimeBetweenLastMiningAttemptAndNow = TimeBetweenLastMiningAttemptAndNow;
        this.CoinsOfUser = CoinsOfUser;
        this.MinimumTimeToMine = MinimumTimeToMine;
    }
}

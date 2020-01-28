export class MiningResult {
    TimeBetweenLastMiningAttemptAndNow: number;
    CoinsOfUser: number;
    constructor(TimeBetweenLastMiningAttemptAndNow: number, CoinsOfUser: number) {
        this.TimeBetweenLastMiningAttemptAndNow = TimeBetweenLastMiningAttemptAndNow;
        this.CoinsOfUser = CoinsOfUser;
    }
}

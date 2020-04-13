export class PollStatus {
    PollWaxed: boolean;
    PollStarted: boolean;
    PollStopped: boolean;
    InDistribution: boolean;
    DistributionCompleted: boolean;
    DistributionStarted: boolean;
    StatisticsOfDistribution: any;
    constructor(PollStatus?: PollStatus) {
        if (PollStatus) {
            this.PollWaxed = PollStatus.PollWaxed;
            this.PollStarted = PollStatus.PollStarted;
            this.PollStopped = PollStatus.PollStopped;
            this.DistributionStarted = PollStatus.DistributionStarted;
            this.InDistribution = PollStatus.InDistribution;
            this.DistributionCompleted = PollStatus.DistributionCompleted;
        } else {
            this.PollWaxed = false;
            this.PollStarted = false;
            this.PollStopped = false;
            this.DistributionStarted = false;
            this.InDistribution = false;
            this.DistributionCompleted = false;
        }

    }
    start() {
        this.PollStarted = true;
        return this;
    }
    stop() {
        this.PollStopped = true;
        return this;

    }
    restart() {
        this.PollStopped = false;
        return this;

    }

    startDistribution() {
        this.InDistribution = true;
        return this;
    }

    wax() {
        this.PollWaxed = true;
        return this;

    }
}

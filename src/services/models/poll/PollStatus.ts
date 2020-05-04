export class PollStatus {
    id: number;
    PollWaxed: boolean;
    PollStarted: boolean;
    PollStopped: boolean;
    DistributionStarted: boolean;
    DistributionCompleted: boolean;
    InDistribution: boolean;
    StatisticsOfDistributionJson: string;
    updated_at:Date;

    constructor(PollStatus?: PollStatus) {
        if (PollStatus) {
            this.id = PollStatus.id;
            this.PollWaxed = PollStatus.PollWaxed;
            this.PollStarted = PollStatus.PollStarted;
            this.PollStopped = PollStatus.PollStopped;
            this.InDistribution = PollStatus.InDistribution;
            this.DistributionStarted = PollStatus.DistributionStarted;
            this.DistributionCompleted = PollStatus.DistributionCompleted;
            this.StatisticsOfDistributionJson = PollStatus.StatisticsOfDistributionJson;
            this.updated_at = PollStatus.updated_at;
        } else {
            this.PollWaxed = false;
            this.PollStarted = false;
            this.PollStopped = false;
            this.InDistribution = false;
            this.DistributionStarted = false;
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
        this.DistributionStarted = true;
        return this;
    }
    setDistributionAsCompleted() {
        this.DistributionCompleted = true;
        return this;
    }
    wax() {
        this.PollWaxed = true;
        return this;
    }
}

export class PollStatus {
    PollWaxed: boolean;
    PollStarted: boolean;
    PollStoped: boolean;
    InDistribution: boolean;
    DistributionCompleted: boolean;
    DistributionStarted: boolean;
    StatisticsOfDistribution: any;
    constructor() {
        this.PollWaxed = false;
        this.PollStarted = false;
        this.PollStoped = false;
        this.DistributionStarted = false;
        this.InDistribution = false;
        this.DistributionCompleted = false;
    }
    start() {
        this.PollStarted = true;
        return this;
    }
    stop() {
        this.PollStoped = true;
        return this;

    }
    restart() {
        this.PollStoped = false;
        return this;

    }

    startDistribution() {
        this.InDistribution = true;
        return this;
    }

    waxe() {
        this.PollWaxed = true;
        return this;

    }
}

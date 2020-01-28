"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PollStatus {
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
    waxe() {
        this.PollWaxed = true;
        return this;
    }
}
exports.PollStatus = PollStatus;

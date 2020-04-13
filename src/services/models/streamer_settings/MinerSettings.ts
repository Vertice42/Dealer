export const MINIMUM_TIME_FOR_MINING = (process.env.MINIMUM_TIME_FOR_MINING) ? Number(process.env.MINIMUM_TIME_FOR_MINING) : 1000;// 1s

export class MinerSettings {
    RewardPerMining: number;
    RewardPerMinute: number;
    constructor(RewardPerMinute: number) {
        this.RewardPerMining = RewardPerMinute / (MINIMUM_TIME_FOR_MINING / 1000) / 60;
        this.RewardPerMinute = RewardPerMinute;
    }
}

//TODO a adicionar variave pra dtes e para produção 
export const MINIMUN_TIME_FOR_MINING = 1000// 1s

export class MinerSettings {
    RewardPerMining: number;
    RewardPerMinute: number;
    constructor(RewardPerMinute: number) {
        this.RewardPerMining = RewardPerMinute/(MINIMUN_TIME_FOR_MINING/1000)/60;
        this.RewardPerMinute = RewardPerMinute;
    }
}

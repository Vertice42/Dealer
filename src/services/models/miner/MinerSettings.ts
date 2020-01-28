//TODO a adicionar variave pra dtes e para produção 
//export const MinimunTimeForMining = 17000// 3m
export const MinimunTimeForMining = 1000// 1s

export class MinerSettings {
    RewardPerMining: number;
    RewardPerMinute: number;
    constructor(RewardPerMinute: number) {
        this.RewardPerMining = RewardPerMinute/(MinimunTimeForMining/1000)/60;
        this.RewardPerMinute = RewardPerMinute;
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO a adicionar variave pra dtes e para produção 
//export const MinimunTimeForMining = 17000// 3m
exports.MinimunTimeForMining = 1000; // 1s
class MinerSettings {
    constructor(RewardPerMinute) {
        this.RewardPerMining = RewardPerMinute / (exports.MinimunTimeForMining / 1000) / 60;
        this.RewardPerMinute = RewardPerMinute;
    }
}
exports.MinerSettings = MinerSettings;

import { Model } from "sequelize/types";

export class Bettings extends Model {
    TwitchUserID: string;
    Bet: number;
    BetAmount: number;
}

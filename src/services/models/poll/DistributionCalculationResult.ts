export class DistributionCalculationResult {
    NumberOfLosers: number
    NumberOfWinners: number
    Lost: number
    Won: number
    TotalBetAmount: number
    EarningsDistributor: number

    constructor(
        NumberOfLosers: number,
        NumberOfWinners: number,
        Lost: number,
        Won: number) {

        this.NumberOfLosers = NumberOfLosers;
        this.NumberOfWinners = NumberOfWinners;
        this.Lost = Lost;
        this.Won = Won;
        this.TotalBetAmount = Lost + Won;
        this.EarningsDistributor = this.TotalBetAmount / Won;

    }
}

export class StatisticsOfDistribution {
    CalculationResult: DistributionCalculationResult
    message: string
    timeOfDistribution: number
    error: boolean

    constructor(DistributionCalculationResult: DistributionCalculationResult,
        message: string,
        timeOfDistribution: number,
        error = false) {
        this.CalculationResult = DistributionCalculationResult;
        this.message = message;
        this.timeOfDistribution = timeOfDistribution;
        this.error = error;
    }
}
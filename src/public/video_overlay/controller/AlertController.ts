import ViewAlerts from "../view/ViewAlerts";
import { sleep } from "../../../services/utils/functions";
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { PollButton } from "../../../services/models/poll/PollButton";
import { addTwitchListeners } from "./MainController";
import TwitchListeners from "../../../services/TwitchListeners";
import { reject, resolve } from "bluebird";
import { TwitchListener } from "../../common/model/TwitchListener";
import { addBet, getCurrentPoll } from "../../common/BackendConnection/Poll";
import { AddBetRequest } from "../../../services/models/poll/AddBetRequest";
import { StatisticsOfDistribution } from "../../../services/models/poll/DistributionCalculationResult";

/**
 * Checks whether a user's pasta was a winner
 * @param PollButtons: Array with the poll buttons
 * @param ChosenButtonID: Winner button identifier
 */
function IsWinner(PollButtons: PollButton[], ChosenButtonID: number) {
    let WinningButtons: PollButton[] = [];
    PollButtons.forEach(button => {
        if (button.IsWinner) {
            WinningButtons.push(button);
        }
    });

    let is_winner = false;
    WinningButtons.forEach(WinningButton => {
        if (WinningButton.ID === ChosenButtonID) is_winner = true;
    });
    return is_winner;
}

/**
 * Intermediate the backend with user actions also controlled alerts
 * depending on the state of the poll
 */
export default class AlertController {
    private Token: string;
    private StreamerID: string;
    private TwitchUserName: string;

    private ViewAlerts: ViewAlerts;
    private CurrentPollStatus: PollStatus;

    private ChangeBet = () => {
        if (localStorage['sbi' + this.TwitchUserName]) {
            this.ViewAlerts.BetAmountInput.setChangedInput();
            addBet(new AddBetRequest(this.Token, this.TwitchUserName,
                Number(localStorage['sbi' + this.TwitchUserName]),
                this.ViewAlerts.getBetValue()))
                .then(async () => {
                    this.ViewAlerts.BetAmountInput.setInputSuccessfully();
                    await sleep(100);
                    this.ViewAlerts.BetAmountInput.setUnchangedInput();
                })
                .catch(() => {
                    this.ViewAlerts.BetAmountInput.setInputError();
                })
        } else {
            this.ViewAlerts.BetAmountInput.setInputError();
        }
    }

    private async setListeners() {
        this.ViewAlerts.onBetIDSelected = this.ChangeBet;
        this.ViewAlerts.BetAmountInput.HTML.onchange = this.ChangeBet;
    }

    private updatePromise: Promise<any>;

    private async updateAlerts(Poll: Poll) {
        let CurrentPollStatus = this.CurrentPollStatus;
        this.CurrentPollStatus = Poll.PollStatus;
        let selected = (Number(localStorage['sbi' + this.TwitchUserName]));

        if ((!CurrentPollStatus) || (CurrentPollStatus.updated_at !== Poll.PollStatus.updated_at)) {
            if (Poll.PollStatus.PollWaxed) {
                return await this.ViewAlerts.HideAllAlerts();
            }

            if (Poll.PollStatus.DistributionCompleted) {
                if (!Number.isNaN(selected)) {
                    if (IsWinner(Poll.PollButtons, selected)) {
                        let StatisticsOfDistribution:StatisticsOfDistribution = JSON.parse(Poll.PollStatus.StatisticsOfDistributionJson)
                        return await this.ViewAlerts.setInWinnerMode(StatisticsOfDistribution.CalculationResult.EarningsDistributor);
                    } else {
                        return await this.ViewAlerts.setInLoserMode();
                    }
                }
                return
            }

            if (Poll.PollStatus.PollStopped) {
                if (!selected) return;
                return await this.ViewAlerts.setInStopeMode();
            }

            if (Poll.PollStatus.PollStarted) {
                return await this.ViewAlerts.setInBetMode(Poll.PollButtons);
            }

        } else {
            return this.ViewAlerts.setButtonsInPollDiv(Poll.PollButtons)
        }
    }

    private TryGetCurrentPoll = async () => {
        return getCurrentPoll(this.StreamerID)
            .then((Poll) => {

                if (Poll) {
                    return resolve(Poll);
                } else {
                    return reject(Poll);
                }

            })
            .catch(async (rej) => {
                await sleep(500);
                return this.TryGetCurrentPoll();
            })
    }

    public async Build() {
        return this.TryGetCurrentPoll()
            .then((Poll: Poll) => {
                this.updatePromise = this.updateAlerts(Poll);

                addTwitchListeners(new TwitchListener(TwitchListeners.onPollChange, async (Poll: Poll) => {
                    await this.updatePromise;
                    this.updatePromise = this.updateAlerts(Poll);
                }))

                this.setListeners();

                return this;
            })

    }

    constructor(Token: string, StreamerID: string, TwitchUserName: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.TwitchUserName = TwitchUserName;

        this.ViewAlerts = new ViewAlerts(this.TwitchUserName);
    }
}
import BackendConnections = require("../../BackendConnection");
import ViewAlerts from "../view/ViewAlerts";
import { sleep, isEquivalent } from "../../../utils/utils";
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { PollButton } from "../../../services/models/poll/PollButton";


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

export default class AllertController {
    StreamerID: string;
    TwitchUserID: string;

    ViewAlerts = new ViewAlerts();
    
    CurrentPollStatus: PollStatus;
    PollObserver: BackendConnections.Watch;

    ChangeBeat = () => {
        if (this.ViewAlerts.SelectedButtonID !== null) {
            this.ViewAlerts.BetAmountInput.setChangedInput();
            BackendConnections.addBet(this.StreamerID, this.TwitchUserID, this.ViewAlerts.SelectedButtonID, this.ViewAlerts.getBetValue())
                .then(async () => {
                    this.ViewAlerts.BetAmountInput.setInputSentSuccessfully();
                    await sleep(100);
                    this.ViewAlerts.BetAmountInput.setUnchangedInput();
                })
                .catch(() => {
                    this.ViewAlerts.BetAmountInput.setInputSentError();
                })
        } else {
            this.ViewAlerts.BetAmountInput.setInputSentError();
        }
    }

    async EnbleAllCommands() {
        this.ViewAlerts.onBeatIDSelected = this.ChangeBeat;
        this.ViewAlerts.BetAmountInput.HTMLInput.onchange = this.ChangeBeat;
    }

    async LoadingStore() {
        this.PollObserver = new BackendConnections.Watch(async () => { return await BackendConnections.getCurrentPoll(this.StreamerID) });
        this.PollObserver.OnWaitch(async (Poll: Poll) => {
            if (isEquivalent(this.CurrentPollStatus, Poll.PollStatus)) {
                this.ViewAlerts.setButtonsInPollDiv(Poll.PollButtons);
            } else {
                if (Poll.PollStatus.PollWaxed) {
                    await this.ViewAlerts.HideAllAlerts();
                } else {
                    if (Poll.PollStatus.PollStarted) {
                        if (Poll.PollStatus.DistributionCompleted) {
                            if (isNaN(this.ViewAlerts.SelectedButtonID)) {
                                await this.ViewAlerts.HideAllAlerts();
                            } else {
                                if (IsWinner(Poll.PollButtons, this.ViewAlerts.SelectedButtonID)) {
                                    this.ViewAlerts.setInWinnerMode(Poll.LossDistributorOfPoll);
                                } else {
                                    this.ViewAlerts.setInLoserMode();
                                }
                            }
                        } else if (Poll.PollStatus.PollStoped) {
                            this.ViewAlerts.setInStopedMode();
                        } else if (Poll.PollStatus.PollStarted) {
                            this.ViewAlerts.setInBetMode(Poll.PollButtons);
                        }
                    }
                }
                this.CurrentPollStatus = Poll.PollStatus;
            }
        })

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingStore()
    }
}
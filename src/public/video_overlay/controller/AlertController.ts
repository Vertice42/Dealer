import BackendConnections = require("../../BackendConnection");
import ViewAlerts from "../view/ViewAlerts";
import { sleep, isEquivalent } from "../../../utils/funtions";
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { PollButton } from "../../../services/models/poll/PollButton";
import { addTwitchListeners } from "./MainController";
import TwitchListeners from "../../../services/TwitchListeners";
import { reject, resolve } from "bluebird";


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
    Token: string;
    StreamerID: string;    
    TwitchUserName: string;

    ViewAlerts:ViewAlerts;
    CurrentPollStatus: PollStatus;

    ChangeBeat = () => {
        if (localStorage['sbi'+this.TwitchUserName] !== null) {
            this.ViewAlerts.BetAmountInput.setChangedInput();
            BackendConnections.addBet(this.Token, this.TwitchUserName, Number(localStorage['sbi'+this.TwitchUserName]), this.ViewAlerts.getBetValue())
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

    private async updateAlerts(Poll: Poll) {
        if (isEquivalent(this.CurrentPollStatus, Poll.PollStatus)) {
            this.ViewAlerts.setButtonsInPollDiv(Poll.PollButtons)
        }
        else {
            await this.ViewAlerts.HideAllAlerts();
            if (Poll.PollStatus.PollWaxed) {
                return
            }

            if (Poll.PollStatus.DistributionCompleted) {
                console.log(localStorage['sbi'+this.TwitchUserName], isNaN((Number(localStorage['sbi'+this.TwitchUserName]))));
                if (isNaN(Number(localStorage['sbi'+this.TwitchUserName]))) {
                } else {
                    if (IsWinner(Poll.PollButtons, Number((localStorage['sbi'+this.TwitchUserName])))) {
                        this.ViewAlerts.setInWinnerMode(Poll.LossDistributorOfPoll);
                    } else {
                        this.ViewAlerts.setInLoserMode();
                    }
                }
                return
            }
            if (Poll.PollStatus.PollStoped) {
                this.ViewAlerts.setInStopedMode();
                return
            }
            if (Poll.PollStatus.PollStarted) {
                this.ViewAlerts.setInBetMode(Poll.PollButtons);
                return
            }
        }

        this.CurrentPollStatus = Poll.PollStatus;
    }
    private TryGetCurrentPoll = async () => {
        return BackendConnections.getCurrentPoll(this.StreamerID)
            .then((Poll) => {

                if (Poll) {
                    return resolve(Poll);
                } else {
                    return reject(Poll)
                }

            })
            .catch(async (rej) => {
                await sleep(500)
                return this.TryGetCurrentPoll();
            })
    }
    async Loading() {
        return this.TryGetCurrentPoll()
            .then((Poll: Poll) => {
                this.updateAlerts(Poll);

                addTwitchListeners(TwitchListeners.onPollChange, async (Poll) => {
                    this.updateAlerts(Poll);
                })

                this.EnbleAllCommands();

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
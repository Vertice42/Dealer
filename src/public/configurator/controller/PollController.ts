import BackendConnections = require("../../BackendConnection");
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { StatusObservation } from "./MainController";
import ViewPollManeger from "../view/ViewPollManeger";

export default class PollController {
    StreamerID: string;
    ViewPollManeger:ViewPollManeger;
    PollObservation: BackendConnections.Watch

    EnbleAllCommands() {
        this.ViewPollManeger.onCommandToCreateSent = () => {
            this.ViewPollManeger.PollStatus = new PollStatus();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus);
        };
        this.ViewPollManeger.onCommandToWaxSent = () => {
            this.ViewPollManeger.PollStatus.PollWaxed = true;
            this.PollObservation.stop();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus);
        };
        this.ViewPollManeger.onCommandToStartSent = () => {
            this.ViewPollManeger.PollStatus.PollStarted = true;
            this.PollObservation.start();
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus);
        };
        this.ViewPollManeger.onCommandToApplyChangesSent = () => {
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus);
        }
        this.ViewPollManeger.onCommandToStopSent = () => {
            this.ViewPollManeger.PollStatus.PollStoped = true;
            this.PollObservation.stop();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus);
        }
        this.ViewPollManeger.onCommandToRestartSent = () => {
            this.ViewPollManeger.PollStatus.PollStoped = false;
            this.PollObservation.start();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus
            );
        }
        this.ViewPollManeger.onCommandToDistributeSent = () => {
            this.ViewPollManeger.PollStatus.InDistribution = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(),
                this.ViewPollManeger.PollStatus)
                .then(() => {
                    new StatusObservation((Poll: Poll) => {
                        if (Poll.PollStatus.DistributionCompleted) {
                            this.ViewPollManeger.PollStatus = Poll.PollStatus;
                            this.ViewPollManeger.setDistributioFninished();
                            return true;
                        }
                        return false;
                    });
                })
        }
    }
    async LoadingCurrentPoll() {
        this.ViewPollManeger = new ViewPollManeger(await BackendConnections.getCurrentPoll(this.StreamerID));
        this.PollObservation = new BackendConnections.Watch(() => { return BackendConnections.getCurrentPoll(this.StreamerID) })
        this.PollObservation.OnWaitch = (Poll: Poll) => {
            if (!this.ViewPollManeger.IsStarted) this.PollObservation.stop();
            this.ViewPollManeger.PollStatus = Poll.PollStatus;
            this.ViewPollManeger.uppdateAllItems(Poll);
        }
        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

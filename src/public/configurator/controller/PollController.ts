import ViewConfig = require("../View");
import BackendConnections = require("../../BackendConnection");
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { StatusObservation } from "./MainController";

export default class PollController {
    StreamerID: string;
    ViewPoll: ViewConfig.ViewPollManeger
    PollObservation: BackendConnections.Watch

    EnbleAllCommands() {
        this.ViewPoll.onCommandToCreateSent = () => {
            this.ViewPoll.PollStatus = new PollStatus();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPoll.PollStatus);
        };
        this.ViewPoll.onCommandToWaxSent = () => {
            this.ViewPoll.PollStatus.PollWaxed = true;
            this.PollObservation.stop();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPoll.PollStatus);
        };
        this.ViewPoll.onCommandToStartSent = () => {
            this.ViewPoll.PollStatus.PollStarted = true;
            this.PollObservation.start();
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPoll.getPollButtons(), this.ViewPoll.PollStatus);
        };
        this.ViewPoll.onCommandToApplyChangesSent = () => {
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPoll.getPollButtons(), this.ViewPoll.PollStatus);
        }
        this.ViewPoll.onCommandToStopSent = () => {
            this.ViewPoll.PollStatus.PollStoped = true;
            this.PollObservation.stop();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPoll.PollStatus);
        }
        this.ViewPoll.onCommandToRestartSent = () => {
            this.ViewPoll.PollStatus.PollStoped = false;
            this.PollObservation.start();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPoll.PollStatus
            );
        }
        this.ViewPoll.onCommandToDistributeSent = () => {
            this.ViewPoll.PollStatus.InDistribution = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPoll.getPollButtons(),
                this.ViewPoll.PollStatus)
                .then(() => {
                    new StatusObservation((Poll: Poll) => {
                        if (Poll.PollStatus.DistributionCompleted) {
                            this.ViewPoll.PollStatus = Poll.PollStatus;
                            this.ViewPoll.setDistributioFninished();
                            return true;
                        }
                        return false;
                    });
                })
        }
    }
    async LoadingCurrentPoll() {
        this.ViewPoll = new ViewConfig.ViewPollManeger(await BackendConnections.getCurrentPoll(this.StreamerID));
        this.PollObservation = new BackendConnections.Watch(() => { return BackendConnections.getCurrentPoll(this.StreamerID) })
        this.PollObservation.OnWaitch = (Poll: Poll) => {
            if (!this.ViewPoll.IsStarted) this.PollObservation.stop();
            this.ViewPoll.PollStatus = Poll.PollStatus;
            this.ViewPoll.uppdateAllItems(Poll);
        }
        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

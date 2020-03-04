import BackendConnections = require("../../BackendConnection");
import { Poll } from "../../../services/models/poll/Poll";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { StatusObservation, NotifyViewers } from "./MainController";
import ViewPollManeger from "../view/ViewPollManeger";
import TwitchListeners from "../../../services/TwitchListeners";

export default class PollController {
    StreamerID: string;
    ViewPollManeger: ViewPollManeger;

    EnbleAllCommands() {
        this.ViewPollManeger.onCommandToCreateSent = async () => {
            this.ViewPollManeger.PollStatus = new PollStatus();
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManeger.onCommandToWaxSent = async () => {
            this.ViewPollManeger.PollStatus.PollWaxed = true;
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })

        };
        this.ViewPollManeger.onCommandToStartSent = async () => {
            this.ViewPollManeger.PollStatus.PollStarted = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManeger.onCommandToApplyChangesSent = async () => {
            return BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManeger.onCommandToStopSent = async () => {
            this.ViewPollManeger.PollStatus.PollStoped = true;
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManeger.onCommandToRestartSent = async () => {
            this.ViewPollManeger.PollStatus.PollStoped = false;
            return BackendConnections.SendToPollManager(this.StreamerID, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })

        }
        this.ViewPollManeger.onCommandToDistributeSent = async () => {
            this.ViewPollManeger.PollStatus.InDistribution = true;
            await BackendConnections.SendToPollManager(this.StreamerID, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus);
            new StatusObservation((Poll: Poll) => {
                if (Poll.PollStatus.DistributionCompleted) {
                    this.ViewPollManeger.PollStatus = Poll.PollStatus;
                    this.ViewPollManeger.setDistributioFninished();
                    return true;
                }
                return false;
            });
        }
    }
    async LoadingCurrentPoll() {
        this.ViewPollManeger = new ViewPollManeger(await BackendConnections.getCurrentPoll(this.StreamerID));
        let Poll = await BackendConnections.getCurrentPoll(this.StreamerID)
        this.ViewPollManeger.PollStatus = Poll.PollStatus;
        this.ViewPollManeger.uppdateAllItems(Poll);

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

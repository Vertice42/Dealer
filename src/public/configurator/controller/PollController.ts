import BackendConnections = require("../../BackendConnection");
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { NotifyViewers, STREAMER_SOCKET } from "./MainController";
import ViewPollManeger from "../view/ViewPollManeger";
import TwitchListeners from "../../../services/TwitchListeners";
import IOListeners from "../../../services/IOListeners";

export default class PollController {
    StreamerID: string;
    ViewPollManeger: ViewPollManeger;

    setAllCommands() {
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
        this.ViewPollManeger.onCommandToRevertChanges = async () => {
            this.ViewPollManeger.update(await BackendConnections.getCurrentPoll(this.StreamerID));
        }
        this.ViewPollManeger.onCommandToDistributeSent = async () => {
            STREAMER_SOCKET.on(IOListeners.onDistribuitionFinish, async () => {

                let CurrentPoll = await BackendConnections.getCurrentPoll(this.StreamerID);
                this.ViewPollManeger.PollStatus = CurrentPoll.PollStatus;
                this.ViewPollManeger.setDistributioFninished();

                NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: CurrentPoll });

                STREAMER_SOCKET.on(IOListeners.onDistribuitionFinish, null);
            });


            await BackendConnections.SendToPollManager(
                this.StreamerID,
                this.ViewPollManeger.getPollButtons(),
                new PollStatus(this.ViewPollManeger.PollStatus).startDistribution()
            )
        }

    }
    async LoadingCurrentPoll() {
        let Poll = await BackendConnections.getCurrentPoll(this.StreamerID)
        this.ViewPollManeger = new ViewPollManeger(Poll);
        this.ViewPollManeger.PollStatus = Poll.PollStatus;
        this.setAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

import BackendConnections = require("../../BackendConnection");
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { NotifyViewers, STREAMER_SOCKET } from "./MainController";
import ViewPollManeger from "../view/ViewPollManeger";
import TwitchListeners from "../../../services/TwitchListeners";
import IOListeners from "../../../services/IOListeners";
import { Observer } from "../../BackendConnection";
import { Poll } from "../../../services/models/poll/Poll";

export default class PollController {
    StreamerID: string;
    Token: string;
    ViewPollManeger: ViewPollManeger;
    PollObserver: Observer;

    setAllCommands() {
        this.ViewPollManeger.onCommandToCreateSent = async () => {
            this.ViewPollManeger.PollStatus = new PollStatus();
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManeger.onCommandToWaxSent = async () => {
            this.ViewPollManeger.PollStatus.PollWaxed = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    this.PollObserver.stop();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })

        };
        this.ViewPollManeger.onCommandToStartSent = async () => {
            this.ViewPollManeger.PollStatus.PollStarted = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus)
                .then(async () => {
                    this.PollObserver.start();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManeger.onCommandToApplyChangesSent = async () => {
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, this.ViewPollManeger.getPollButtons(), this.ViewPollManeger.PollStatus)
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManeger.onCommandToStopSent = async () => {
            this.ViewPollManeger.PollStatus.PollStoped = true;
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    this.PollObserver.stop();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManeger.onCommandToRestartSent = async () => {
            this.ViewPollManeger.PollStatus.PollStoped = false;
            return BackendConnections.SendToPollManager(this.StreamerID, this.Token, null, this.ViewPollManeger.PollStatus)
                .then(async () => {
                    this.PollObserver.start();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await BackendConnections.getCurrentPoll(this.StreamerID) });
                })

        }
        this.ViewPollManeger.onCommandToRevertChanges = async () => {
            this.ViewPollManeger.updateItems(await BackendConnections.getCurrentPoll(this.StreamerID));
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
                this.StreamerID, this.Token,
                this.ViewPollManeger.getPollButtons(),
                new PollStatus(this.ViewPollManeger.PollStatus).startDistribution()
            )
        }

    }
    async LoadingCurrentPoll() {
        let Poll = await BackendConnections.getCurrentPoll(this.StreamerID)
        this.ViewPollManeger = new ViewPollManeger(Poll);

        this.PollObserver = new Observer(async () => BackendConnections.getCurrentPoll(this.StreamerID), 500);
        this.PollObserver.OnWaitch = (Poll: Poll) => {
            this.ViewPollManeger.uppdateVotesOfAllItems(Poll);
        }

        this.ViewPollManeger.onStatusChange = (PollStatus) => {
            if (PollStatus.PollStarted && !PollStatus.PollStoped) {
                this.PollObserver.start();
            }
            else {
                this.PollObserver.stop();
            }

        };
        this.ViewPollManeger.PollStatus = Poll.PollStatus;
        this.setAllCommands();
    }

    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

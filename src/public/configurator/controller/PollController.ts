import { NotifyViewers, STREAMER_SOCKET } from "./MainController";
import ViewPollManager from "../view/ViewPollManager";
import TwitchListeners from "../../../services/TwitchListeners";
import IOListeners from "../../../services/IOListeners";
import { Poll } from "../../../services/models/poll/Poll";
import { PollManager, getCurrentPoll } from "../../common/BackendConnection/Poll";
import { PollRequest } from "../../../services/models/poll/PollRequest";
import { PollStatus } from "../../../services/models/poll/PollStatus";
import { Observer } from "../../../services/utils/Observer";

/**
 * It is intended to control the connection between a ux and the back end
 * @param Token : JSON Web Token
 * @param StreamerID : Identified from the streamer used the extension
 */
export default class PollController {
    private StreamerID: string;
    private Token: string;

    private ViewPollManager: ViewPollManager;
    private PollObserver: Observer;

    private setListeners() {
        this.ViewPollManager.onCommandToCreateSent = async () => {
            this.ViewPollManager.PollStatus = new PollStatus();
            return PollManager(new PollRequest(this.Token, null, this.ViewPollManager.PollStatus))
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManager.onCommandToWaxSent = async () => {
            this.ViewPollManager.PollStatus.PollWaxed = true;
            return PollManager(new PollRequest(this.Token, null, this.ViewPollManager.PollStatus))
                .then(async () => {
                    this.PollObserver.stop();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })

        };
        this.ViewPollManager.onCommandToStartSent = async () => {
            this.ViewPollManager.PollStatus.PollStarted = true;
            return PollManager(new PollRequest(this.Token, this.ViewPollManager.getPollButtons(), this.ViewPollManager.PollStatus))
                .then(async () => {
                    this.PollObserver.start();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })
        };
        this.ViewPollManager.onCommandToApplyChangesSent = async () => {
            return PollManager(new PollRequest(this.Token, this.ViewPollManager.getPollButtons(), this.ViewPollManager.PollStatus))
                .then(async () => {
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManager.onCommandToStopSent = async () => {
            this.ViewPollManager.PollStatus.PollStopped = true;
            return PollManager(new PollRequest(this.Token, null, this.ViewPollManager.PollStatus))
                .then(async () => {
                    this.PollObserver.stop();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })
        }
        this.ViewPollManager.onCommandToRestartSent = async () => {
            this.ViewPollManager.PollStatus.PollStopped = false;
            return PollManager(new PollRequest(this.Token, null, this.ViewPollManager.PollStatus))
                .then(async () => {
                    this.PollObserver.start();
                    NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: await getCurrentPoll(this.StreamerID) });
                })

        }
        this.ViewPollManager.onCommandToRevertChanges = async () => {
            this.ViewPollManager.updateItems(await getCurrentPoll(this.StreamerID));
        }
        this.ViewPollManager.onCommandToDistributeSent = async () => {
            let onDistributionFinish = async () => {
                let CurrentPoll = await getCurrentPoll(this.StreamerID);
                this.ViewPollManager.PollStatus = CurrentPoll.PollStatus;
                this.ViewPollManager.setDistributionsFinished();
                NotifyViewers({ ListenerName: TwitchListeners.onPollChange, data: CurrentPoll });

                STREAMER_SOCKET.removeEventListener(IOListeners.onDistributionFinish, onDistributionFinish)
            }
            STREAMER_SOCKET.addEventListener(IOListeners.onDistributionFinish, onDistributionFinish);
            this.ViewPollManager.PollStatus.DistributionStarted = true;
            await PollManager(new PollRequest(this.Token, this.ViewPollManager.getPollButtons(), this.ViewPollManager.PollStatus));
        }
    }
    private async LoadingCurrentPoll() {
        let Poll = await getCurrentPoll(this.StreamerID)
        this.ViewPollManager = new ViewPollManager(Poll);

        this.PollObserver = new Observer(async () => getCurrentPoll(this.StreamerID), 500);
        this.PollObserver.OnWatch = (Poll: Poll) => {
            this.ViewPollManager.updateVotesOfAllItems(Poll);
        }

        this.ViewPollManager.onStatusChange = (PollStatus) => {
            if (PollStatus.PollStarted && !PollStatus.PollStopped) {
                this.PollObserver.start();
            }
            else {
                this.PollObserver.stop();
            }

        };
        this.ViewPollManager.PollStatus = Poll.PollStatus;

        this.setListeners();
    }

    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.LoadingCurrentPoll();
    }
} 

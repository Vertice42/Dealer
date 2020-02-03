"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ViewConfig = require("./View");
const BackendConnections = require("../BackendConnection");
const BackendConnection_1 = require("../BackendConnection");
const PollButton_1 = require("../../services/models/poll/PollButton");
const PollStatus_1 = require("../../services/models/poll/PollStatus");
const MinerSettings_1 = require("../../services/models/miner/MinerSettings");
const twitch = window.Twitch.ext;
var token, StreamerID;
var ViewPoll;
function getButtonsOf(ViewPoll) {
    let Buttons = [];
    ViewPoll.PollItemsViewers.forEach(PollItemViewer => {
        Buttons.push(new PollButton_1.PollButton(PollItemViewer.ID, PollItemViewer.getNameInputValue(), PollItemViewer.getColorInputValue(), PollItemViewer.IsWinner()));
    });
    return Buttons;
}
class StatusObservation {
    observe(onObserver) {
        BackendConnections.getCurrentPoll(StreamerID)
            .then((Poll) => {
            if (!onObserver(Poll))
                setTimeout(() => {
                    this.observe(onObserver);
                }, 150);
        });
    }
    constructor(onObserver) {
        this.observe(onObserver);
    }
}
twitch.onContext((context) => {
    console.log(context);
});
twitch.onAuthorized((auth) => __awaiter(void 0, void 0, void 0, function* () {
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    let Poll = yield BackendConnections.getCurrentPoll(StreamerID);
    ViewPoll = new ViewConfig.ViewPollManeger(Poll);
    let watchPoll;
    ViewPoll.PollStatus = Poll.PollStatus;
    watchPoll = new BackendConnection_1.WatchPoll(StreamerID);
    watchPoll.onWatch = (Poll) => ViewPoll.uppdateAllItems(Poll);
    if (ViewPoll.IsStarted)
        watchPoll.start();
    else
        watchPoll.stop();
    ViewPoll.onCommandToCreateSent = () => {
        ViewPoll.PollStatus = new PollStatus_1.PollStatus();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToWaxSent = () => {
        ViewPoll.PollStatus.PollWaxed = true;
        watchPoll.stop();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToStartSent = () => {
        ViewPoll.PollStatus.PollStarted = true;
        watchPoll.start();
        return BackendConnections.SendToPollManager(StreamerID, getButtonsOf(ViewPoll), ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToApplyChangesSent = () => {
        return BackendConnections.SendToPollManager(StreamerID, getButtonsOf(ViewPoll), ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToStopSent = () => {
        ViewPoll.PollStatus.PollStoped = true;
        watchPoll.stop();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToRestartSent = () => {
        ViewPoll.PollStatus.PollStoped = false;
        watchPoll.start();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus);
    };
    ViewPoll.onCommandToDistributeSent = () => {
        ViewPoll.PollStatus.InDistribution = true;
        return BackendConnections.SendToPollManager(StreamerID, getButtonsOf(ViewPoll), ViewPoll.PollStatus)
            .then(() => {
            new StatusObservation((Poll) => {
                if (Poll.PollStatus.DistributionCompleted) {
                    ViewPoll.PollStatus = Poll.PollStatus;
                    ViewPoll.setDistributioFninished();
                    return true;
                }
                return false;
            });
        });
    };
    const VIEW_SETTINGS = new ViewConfig.ViewSettings();
    let minerSettings = yield BackendConnections.GetMiner(StreamerID);
    VIEW_SETTINGS.HourlyRewardInput.value = (~~(minerSettings.RewardPerMinute * 60)).toString();
    VIEW_SETTINGS.HourlyRewardInput.onchange = () => {
        BackendConnections.SendToMinerManager(StreamerID, new MinerSettings_1.MinerSettings(Number(VIEW_SETTINGS.HourlyRewardInput.value) / 60));
    };
}));

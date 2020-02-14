"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewConfig = require("./View");
const BackendConnections = require("../BackendConnection");
const BackendConnection_1 = require("../BackendConnection");
const PollButton_1 = require("../../services/models/poll/PollButton");
const PollStatus_1 = require("../../services/models/poll/PollStatus");
const MinerSettings_1 = require("../../services/models/miner/MinerSettings");
const utils_1 = require("../../utils/utils");
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
twitch.onAuthorized(async (auth) => {
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    let Poll = await BackendConnections.getCurrentPoll(StreamerID);
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
    let minerSettings = await BackendConnections.GetMinerSettings(StreamerID);
    VIEW_SETTINGS.HourlyRewardInput.HTMLInput.value = (~~(minerSettings.RewardPerMinute * 60)).toString();
    VIEW_SETTINGS.HourlyRewardInput.HTMLInput.onchange = () => {
        VIEW_SETTINGS.HourlyRewardInput.setChangedInput();
        BackendConnections.SendToMinerManager(StreamerID, new MinerSettings_1.MinerSettings(Number(VIEW_SETTINGS.HourlyRewardInput.HTMLInput.value) / 60))
            .then(async () => {
            VIEW_SETTINGS.HourlyRewardInput.setInputSentSuccessfully();
            await utils_1.sleep(100);
            VIEW_SETTINGS.HourlyRewardInput.setUnchangedInput();
        }).catch(() => {
            VIEW_SETTINGS.HourlyRewardInput.setInputSentError();
        });
    };
    const VIEW_STORE = new ViewConfig.ViewStore();
    let StoreItems = await BackendConnection_1.GetStore(StreamerID);
    StoreItems.forEach(StoreItem => VIEW_STORE.addStoreItem(StoreItem));
    VIEW_STORE.onDescriptionChange = (ViewStoreItem) => {
        ViewStoreItem.DescriptionInput.setChangedInput();
        BackendConnection_1.SendToStoreManager(StreamerID, ViewStoreItem)
            .then(async () => {
            ViewStoreItem.DescriptionInput.setInputSentSuccessfully();
            await utils_1.sleep(500);
            ViewStoreItem.DescriptionInput.setUnchangedInput();
        })
            .catch((rej) => {
            console.log(rej);
            ViewStoreItem.DescriptionInput.setInputSentError();
        });
    };
    VIEW_STORE.onPriceChange = (ViewStoreItem) => {
        ViewStoreItem.PriceInput.setChangedInput();
        BackendConnection_1.SendToStoreManager(StreamerID, ViewStoreItem)
            .then(async () => {
            ViewStoreItem.PriceInput.setInputSentSuccessfully();
            await utils_1.sleep(500);
            ViewStoreItem.PriceInput.setUnchangedInput();
        })
            .catch((rej) => {
            console.log(rej);
            ViewStoreItem.PriceInput.setInputSentError();
        });
    };
    VIEW_STORE.onAddStoreItemActive = () => {
        VIEW_STORE.addStoreItem(null);
    };
    VIEW_STORE.onFileInputChange = async (ViewStoreItem) => {
        let file = ViewStoreItem.HTML_InputFile.files[0];
        if (file)
            BackendConnections.UploadFile(StreamerID, file.name, file)
                .then((res) => { console.log(res); });
    };
    VIEW_STORE.onButtonDeleteActive = (StoreItem) => {
        VIEW_STORE.removeStoreItem(StoreItem);
    };
});

import ViewConfig = require("./View");
import BackendConnections = require("../BackendConnection");
import { WatchPoll, SendToStoreManager, GetStore } from "../BackendConnection";
import { PollButton } from "../../services/models/poll/PollButton";
import { PollStatus } from "../../services/models/poll/PollStatus";
import { Poll } from "../../services/models/poll/Poll";
import { MinerSettings } from "../../services/models/miner/MinerSettings";
import { sleep } from "../../utils/utils";
import StoreItem from "../../services/models/store/StoreItem";

const twitch: TwitchExt = window.Twitch.ext;
var token, StreamerID;

var ViewPoll: ViewConfig.ViewPollManeger;

function getButtonsOf(ViewPoll: ViewConfig.ViewPollManeger): PollButton[] {
    let Buttons = [];
    ViewPoll.PollItemsViewers.forEach(PollItemViewer => {
        Buttons.push(new PollButton(
            PollItemViewer.ID,
            PollItemViewer.getNameInputValue(),
            PollItemViewer.getColorInputValue(),
            PollItemViewer.IsWinner()))
    });
    return Buttons;
}

class StatusObservation {

    private observe(onObserver: (arg0: Poll) => boolean) {
        BackendConnections.getCurrentPoll(StreamerID)
            .then((Poll: Poll) => {
                if (!onObserver(Poll))
                    setTimeout(() => {
                        this.observe(onObserver);
                    }, 150);
            })
    }

    constructor(onObserver: (arg0: Poll) => boolean) {
        this.observe(onObserver);
    }
}

twitch.onContext((context) => {
    console.log(context);
})

twitch.onAuthorized(async (auth) => {
    token = auth.token;
    StreamerID = auth.channelId.toLowerCase();
    let Poll = await BackendConnections.getCurrentPoll(StreamerID);

    ViewPoll = new ViewConfig.ViewPollManeger(Poll);
    let watchPoll: WatchPoll;

    ViewPoll.PollStatus = Poll.PollStatus;
    watchPoll = new WatchPoll(StreamerID);

    watchPoll.onWatch = (Poll: Poll) => ViewPoll.uppdateAllItems(Poll);

    if (ViewPoll.IsStarted) watchPoll.start();
    else watchPoll.stop();

    ViewPoll.onCommandToCreateSent = () => {
        ViewPoll.PollStatus = new PollStatus();
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
    }
    ViewPoll.onCommandToStopSent = () => {
        ViewPoll.PollStatus.PollStoped = true;
        watchPoll.stop();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus);
    }
    ViewPoll.onCommandToRestartSent = () => {
        ViewPoll.PollStatus.PollStoped = false;
        watchPoll.start();
        return BackendConnections.SendToPollManager(StreamerID, null, ViewPoll.PollStatus
        );
    }
    ViewPoll.onCommandToDistributeSent = () => {
        ViewPoll.PollStatus.InDistribution = true;
        return BackendConnections.SendToPollManager(StreamerID, getButtonsOf(ViewPoll),
            ViewPoll.PollStatus)
            .then(() => {
                new StatusObservation((Poll: Poll) => {
                    if (Poll.PollStatus.DistributionCompleted) {
                        ViewPoll.PollStatus = Poll.PollStatus;
                        ViewPoll.setDistributioFninished();
                        return true;
                    }
                    return false;
                });
            })
    }

    const VIEW_SETTINGS = new ViewConfig.ViewSettings();

    let minerSettings = await BackendConnections.GetMinerSettings(StreamerID);

    VIEW_SETTINGS.HourlyRewardInput.HTMLInput.value = (~~(minerSettings.RewardPerMinute * 60)).toString();

    VIEW_SETTINGS.HourlyRewardInput.HTMLInput.onchange = () => {
        VIEW_SETTINGS.HourlyRewardInput.setChangedInput();
        BackendConnections.SendToMinerManager(StreamerID,
            new MinerSettings(Number(VIEW_SETTINGS.HourlyRewardInput.HTMLInput.value) / 60))
            .then(async () => {
                VIEW_SETTINGS.HourlyRewardInput.setInputSentSuccessfully();
                await sleep(100);
                VIEW_SETTINGS.HourlyRewardInput.setUnchangedInput();
            }).catch(() => {
                VIEW_SETTINGS.HourlyRewardInput.setInputSentError();
            })
    }

    const VIEW_STORE = new ViewConfig.ViewStore();

    let StoreItems:StoreItem[] = await GetStore(StreamerID);
    StoreItems.forEach(StoreItem => VIEW_STORE.addStoreItem(StoreItem));

    VIEW_STORE.onDescriptionChange = (ViewStoreItem) => {
        ViewStoreItem.DescriptionInput.setChangedInput();
        SendToStoreManager(StreamerID,<StoreItem>ViewStoreItem)
        .then(async ()=>{
            ViewStoreItem.DescriptionInput.setInputSentSuccessfully();
            await sleep(500);
            ViewStoreItem.DescriptionInput.setUnchangedInput();
        })
        .catch((rej)=>{
            console.log(rej);
            ViewStoreItem.DescriptionInput.setInputSentError();
        })
    }

    VIEW_STORE.onPriceChange = (ViewStoreItem) => {
        ViewStoreItem.PriceInput.setChangedInput();
        SendToStoreManager(StreamerID,<StoreItem>ViewStoreItem)
        .then(async ()=>{
            ViewStoreItem.PriceInput.setInputSentSuccessfully();
            await sleep(500);
            ViewStoreItem.PriceInput.setUnchangedInput();
        })
        .catch((rej)=>{
            console.log(rej);
            ViewStoreItem.PriceInput.setInputSentError();
        })
    }

    VIEW_STORE.onAddStoreItemActive = () => {
        VIEW_STORE.addStoreItem(null);
    }

    VIEW_STORE.onButtonDeleteActive = (StoreItem) => {
        VIEW_STORE.removeStoreItem(StoreItem)
    }

});
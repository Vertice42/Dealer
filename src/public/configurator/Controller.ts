import ViewConfig = require("./View");
import BackendConnections = require("../BackendConnection");
import io = require('socket.io-client');

import { WatchPoll, SendToStoreManager, GetStore, DeteleStoreItem, host } from "../BackendConnection";
import { PollButton } from "../../services/models/poll/PollButton";
import { PollStatus } from "../../services/models/poll/PollStatus";
import { Poll } from "../../services/models/poll/Poll";
import { sleep } from "../../utils/utils";
import StoreItem from "../../services/models/store/StoreItem";
import UploadFileResponse from "../../services/models/files_manager/UploadFileResponse";
import PurchaseOrder from "../../services/models/store/PurchaseOrder";
import { MinerSettings } from "../../services/models/miner/MinerSettings";
import Links from "../../services/Links";

const socket = io(host);

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

    socket.emit('registered', StreamerID)

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

    const ViewSettings = new ViewConfig.ViewSettings;

    let minerSettings = await BackendConnections.GetMinerSettings(StreamerID);

    ViewSettings.HourlyRewardInput.HTMLInput.value = (~~(minerSettings.RewardPerMinute * 60)).toString();

    ViewSettings.HourlyRewardInput.HTMLInput.onchange = () => {
        ViewSettings.HourlyRewardInput.setChangedInput();
        BackendConnections.SendToMinerManager(StreamerID,
            new MinerSettings(Number(ViewSettings.HourlyRewardInput.HTMLInput.value) / 60))
            .then(async () => {
                ViewSettings.HourlyRewardInput.setInputSentSuccessfully();
                await sleep(100);
                ViewSettings.HourlyRewardInput.setUnchangedInput();
            }).catch(() => {
                ViewSettings.HourlyRewardInput.setInputSentError();
            })
    }

    const ViewStore = new ViewConfig.ViewStore;

    let StoreItems: StoreItem[] = await GetStore(StreamerID, -1);//ALL Items === -1
    StoreItems.forEach(StoreItem => ViewStore.addStoreItem(StoreItem));

    ViewStore.onDescriptionChange = (ViewStoreItem) => {
        ViewStoreItem.DescriptionInput.setChangedInput();
        SendToStoreManager(StreamerID, <StoreItem>ViewStoreItem)
            .then(async () => {
                ViewStoreItem.DescriptionInput.setInputSentSuccessfully();
                await sleep(500);
                ViewStoreItem.DescriptionInput.setUnchangedInput();
            })
            .catch((rej) => {
                console.log(rej);
                ViewStoreItem.DescriptionInput.setInputSentError();
            })
    }

    ViewStore.onPriceChange = (ViewStoreItem) => {
        ViewStoreItem.PriceInput.setChangedInput();
        SendToStoreManager(StreamerID, <StoreItem>ViewStoreItem)
            .then(async () => {
                ViewStoreItem.PriceInput.setInputSentSuccessfully();
                await sleep(500);
                ViewStoreItem.PriceInput.setUnchangedInput();
            })
            .catch((rej) => {
                console.log(rej);
                ViewStoreItem.PriceInput.setInputSentError();
            })
    }

    ViewStore.onAddStoreItemActive = () => {
        ViewStore.addStoreItem(null);
    }

    ViewStore.onFileInputChange = async (ViewStoreItem) => {
        let file = ViewStoreItem.HTML_InputFile.files[0];
        if (file) {
            BackendConnections.UploadFile(StreamerID, file.name, file
            ).then(async (UploadFileResponse: UploadFileResponse) => {
                let StoreItem = <StoreItem>ViewStoreItem;
                StoreItem.FileName = UploadFileResponse.FileName;
                await SendToStoreManager(StreamerID, StoreItem);
                ViewStoreItem.ResponsiveInputFile.setUpgradeable();
            }
            ).catch(rej => console.log(rej))
        }
    }

    ViewStore.onButtonDeleteActive = async (StoreItem) => {
        await DeteleStoreItem(StreamerID, StoreItem)
        ViewStore.removeStoreItem(StoreItem)
    }

    const ViewPurchaseOrders = new ViewConfig.ViewPurchaseOrders;

    let PurchaseOrders = [];

    function pay({ ViewPurchasedItem, PurchaseOrder, StoreItem }) {
        ViewPurchaseOrders.HTML_AudioPlayer.src = BackendConnections.getUrlOfFile(StreamerID, StoreItem.FileName);

        ViewPurchaseOrders.HTML_AudioPlayer.onplay = () => {
            ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
            ViewPurchaseOrders.setCurrentPay(PurchaseOrder.TwitchUserID,StoreItem.Description)
        }

        ViewPurchaseOrders.HTML_AudioPlayer.ontimeupdate = (event) => {
            ViewPurchaseOrders.setAudioPlayerProgress(
                ViewPurchaseOrders.HTML_AudioPlayer.currentTime / ViewPurchaseOrders.HTML_AudioPlayer.duration * 100)
        }
        ViewPurchaseOrders.HTML_AudioPlayer.play().catch(() => {
            let onBodyClick = () => {
                ViewPurchaseOrders.HTML_AudioPlayer.play()
                document.body.removeEventListener('click', onBodyClick)
            }
            document.body.addEventListener('click', onBodyClick)
        })

        ViewPurchaseOrders.HTML_AudioPlayer.onended = () => {
            BackendConnections.DeletePurchaseOrder(StreamerID, PurchaseOrder, false);
            PurchaseOrders.shift()
            if (PurchaseOrders[0]) pay(PurchaseOrders[0])
        }
    }

    ViewPurchaseOrders.onAddPuchaseOrder = (ViewPurchasedItem, PurchaseOrder, StoreItem) => {
        PurchaseOrders.push({ ViewPurchasedItem, PurchaseOrder, StoreItem });

        if (PurchaseOrders.length === 1) pay({ ViewPurchasedItem, PurchaseOrder, StoreItem })
    }

    ViewPurchaseOrders.onButtonPurchaseOrderRefundActive = (ViewPurchasedItem, PurchaseOrder) => {
        ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
        PurchaseOrders.splice(ViewPurchasedItem.id,1);
        BackendConnections.DeletePurchaseOrder(StreamerID, PurchaseOrder, true);
    }

    (await BackendConnections.GetPurchaseOrders(StreamerID)).forEach(async PurchaseOrder => {
        ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, await BackendConnections.GetStore(StreamerID, PurchaseOrder.StoreItemID));
    })

    socket.on('PurchasedItem', async (PurchaseOrder: PurchaseOrder) => {
        ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, await BackendConnections.GetStore(StreamerID, PurchaseOrder.StoreItemID));
    })

});


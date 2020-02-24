"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewConfig = require("./View");
const BackendConnections = require("../BackendConnection");
const io = require("socket.io-client");
const BackendConnection_1 = require("../BackendConnection");
const PollButton_1 = require("../../services/models/poll/PollButton");
const PollStatus_1 = require("../../services/models/poll/PollStatus");
const utils_1 = require("../../utils/utils");
const MinerSettings_1 = require("../../services/models/miner/MinerSettings");
const socket = io(BackendConnection_1.host);
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
    socket.emit('registered', StreamerID);
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
    const ViewSettings = new ViewConfig.ViewSettings;
    ViewSettings.HourlyRewardInput.HTMLInput.value = (~~((await BackendConnections.GetMinerSettings(StreamerID)).RewardPerMinute * 60)).toString();
    ViewSettings.HourlyRewardInput.HTMLInput.onchange = () => {
        ViewSettings.HourlyRewardInput.setChangedInput();
        BackendConnections.SendToMinerManager(StreamerID, new MinerSettings_1.MinerSettings(Number(ViewSettings.HourlyRewardInput.HTMLInput.value) / 60))
            .then(async () => {
            ViewSettings.HourlyRewardInput.setInputSentSuccessfully();
            await utils_1.sleep(100);
            ViewSettings.HourlyRewardInput.setUnchangedInput();
        }).catch(() => {
            ViewSettings.HourlyRewardInput.setInputSentError();
        });
    };
    var CoinsSettings = await BackendConnections.GetCoinsSettings(StreamerID);
    ViewSettings.CoinNameInput.HTMLInput.value = CoinsSettings.CoinName;
    ViewSettings.setCoinIMG(BackendConnections.getUrlOfFile(StreamerID, CoinsSettings.FileNameOfCoinImage));
    ViewSettings.CoinNameInput.HTMLInput.onchange = async () => {
        ViewSettings.CoinNameInput.setChangedInput();
        CoinsSettings.CoinName = ViewSettings.CoinNameInput.HTMLInput.value;
        BackendConnections.SendToCoinsSettingsManager(StreamerID, CoinsSettings)
            .then(async () => {
            ViewSettings.CoinNameInput.setInputSentSuccessfully();
            await utils_1.sleep(100);
            ViewSettings.CoinNameInput.setUnchangedInput();
        }).catch(() => {
            ViewSettings.CoinNameInput.setInputSentError();
        });
    };
    ViewSettings.InputCoinImg.onchange = () => {
        let file = ViewSettings.InputCoinImg.files[0];
        if (file) {
            BackendConnections.UploadFile(StreamerID, file.name, file).then(async (UploadFileResponse) => {
                CoinsSettings.FileNameOfCoinImage = file.name;
                BackendConnections.SendToCoinsSettingsManager(StreamerID, CoinsSettings);
                ViewSettings.setCoinIMG(BackendConnections.getUrlOfFile(StreamerID, CoinsSettings.FileNameOfCoinImage));
            }).catch(rej => console.log(rej));
        }
    };
    const ViewStore = new ViewConfig.ViewStore;
    let StoreItems = await BackendConnection_1.GetStore(StreamerID, -1); //ALL Items === -1
    StoreItems.forEach(StoreItem => ViewStore.addStoreItem(StoreItem));
    ViewStore.onDescriptionChange = (ViewStoreItem) => {
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
    ViewStore.onPriceChange = (ViewStoreItem) => {
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
    ViewStore.onAddStoreItemActive = () => {
        ViewStore.addStoreItem(null);
    };
    ViewStore.onFileInputChange = async (ViewStoreItem) => {
        let file = ViewStoreItem.HTML_InputFile.files[0];
        if (file) {
            BackendConnections.UploadFile(StreamerID, file.name, file).then(async (UploadFileResponse) => {
                let StoreItem = ViewStoreItem;
                StoreItem.FileName = UploadFileResponse.FileName;
                await BackendConnection_1.SendToStoreManager(StreamerID, StoreItem);
                ViewStoreItem.ResponsiveInputFile.setUpgradeable();
            }).catch(rej => console.log(rej));
        }
    };
    ViewStore.onButtonDeleteActive = async (StoreItem) => {
        await BackendConnection_1.DeteleStoreItem(StreamerID, StoreItem);
        ViewStore.removeStoreItem(StoreItem);
    };
    const ViewPurchaseOrders = new ViewConfig.ViewPurchaseOrders;
    let PurchaseOrders = [];
    function pay({ ViewPurchasedItem, PurchaseOrder, StoreItem }) {
        ViewPurchaseOrders.HTML_AudioPlayer.src = BackendConnections.getUrlOfFile(StreamerID, StoreItem.FileName);
        ViewPurchaseOrders.HTML_AudioPlayer.onplay = () => {
            ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
            ViewPurchaseOrders.setCurrentPay(PurchaseOrder.TwitchUserID, StoreItem.Description);
            ViewPurchaseOrders.EnableAudioPlayerButtons();
            ViewPurchaseOrders.setStarted();
            ViewPurchaseOrders.HTML_AudioPlayer.onplay = null;
        };
        ViewPurchaseOrders.HTML_PauseAudioPlayerButton.onclick = () => {
            if (ViewPurchaseOrders.IsStarted()) {
                ViewPurchaseOrders.setInPause();
                ViewPurchaseOrders.HTML_AudioPlayer.pause();
            }
            else {
                ViewPurchaseOrders.setStarted();
                ViewPurchaseOrders.HTML_AudioPlayer.play();
            }
        };
        ViewPurchaseOrders.HTML_RefundCurrentAudioButton.onclick = async () => {
            await BackendConnections.DeletePurchaseOrder(StreamerID, PurchaseOrder, true);
            ViewPurchaseOrders.HTML_AudioPlayer.pause();
            ViewPurchaseOrders.HTML_AudioPlayer.src = '';
        };
        ViewPurchaseOrders.HTML_AudioPlayer.ontimeupdate = (event) => {
            ViewPurchaseOrders.setAudioPlayerProgress(ViewPurchaseOrders.HTML_AudioPlayer.currentTime / ViewPurchaseOrders.HTML_AudioPlayer.duration * 100);
        };
        ViewPurchaseOrders.HTML_AudioPlayer.play().catch(() => {
            let onBodyClick = () => {
                ViewPurchaseOrders.HTML_AudioPlayer.play();
                document.body.removeEventListener('click', onBodyClick);
            };
            document.body.addEventListener('click', onBodyClick);
        });
        ViewPurchaseOrders.HTML_AudioPlayer.onended = () => {
            BackendConnections.DeletePurchaseOrder(StreamerID, PurchaseOrder, false);
            PurchaseOrders.shift();
            if (PurchaseOrders[0])
                pay(PurchaseOrders[0]);
        };
    }
    ViewPurchaseOrders.onAddPuchaseOrder = (ViewPurchasedItem, PurchaseOrder, StoreItem) => {
        PurchaseOrders.push({ ViewPurchasedItem, PurchaseOrder, StoreItem });
        if (PurchaseOrders.length === 1)
            pay({ ViewPurchasedItem, PurchaseOrder, StoreItem });
    };
    ViewPurchaseOrders.onButtonPurchaseOrderRefundActive = (ViewPurchasedItem, PurchaseOrder) => {
        ViewPurchaseOrders.removeViewPurchaseOrder(ViewPurchasedItem);
        PurchaseOrders.splice(ViewPurchasedItem.id, 1);
        BackendConnections.DeletePurchaseOrder(StreamerID, PurchaseOrder, true);
    };
    (await BackendConnections.GetPurchaseOrders(StreamerID)).forEach(async (PurchaseOrder) => {
        ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, await BackendConnections.GetStore(StreamerID, PurchaseOrder.StoreItemID));
    });
    socket.on('PurchasedItem', async (PurchaseOrder) => {
        ViewPurchaseOrders.addViewPurchaseOrder(PurchaseOrder, await BackendConnections.GetStore(StreamerID, PurchaseOrder.StoreItemID));
    });
    const ViewWallets = new ViewConfig.ViewWallets();
    let WatchWallets = new BackendConnections.Watch(() => BackendConnections.GetWallets(StreamerID));
    WatchWallets.OnWaitch = (Wallets) => ViewWallets.uptate(Wallets);
    let SearchWallets = async () => {
        let newValue = ViewWallets.HTML_SearchInput.value;
        let isIvalid = (newValue === '');
        if (isIvalid)
            WatchWallets.stat();
        else
            await WatchWallets.stop();
        ViewWallets.uptate(await BackendConnections.GetWallets(StreamerID, (isIvalid) ? undefined : newValue));
    };
    ViewWallets.HTML_SearchInput.onchange = SearchWallets;
    ViewWallets.HTMl_SearchInputButton.onclick = SearchWallets;
    ViewWallets.onWalletInputChange = (TwitchUserID, ViewWallet) => {
        ViewWallet.InputOfCoinsOfWalletOfUser.setChangedInput();
        BackendConnections.SendToWalletManager(StreamerID, TwitchUserID, Number(ViewWallet.InputOfCoinsOfWalletOfUser.HTMLInput.value))
            .then(async () => {
            ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentSuccessfully();
            await utils_1.sleep(500);
            ViewWallet.InputOfCoinsOfWalletOfUser.setUnchangedInput();
        })
            .catch((rej) => {
            ViewWallet.InputOfCoinsOfWalletOfUser.setInputSentError();
        });
    };
});

import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/funtions";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import StoreItem, { StoreTypes } from "../../../services/models/store/StoreItem";
import ViewStore, { ViewStoreItem } from "../view/ViewStore";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";
import TwitchListeners from "../../../services/TwitchListeners";
import { NotifyViewers, STREAMER_SOCKET } from "./MainController";
import { reject } from "bluebird";
import FolderTypes from "../../../services/models/files_manager/FolderTypes";
import { ViewAdvertisement } from "../view/ViewAdvertising";
import IOListeners from "../../../services/IOListeners";

export default class StoreController {
    StreamerID: string;
    Token: string;

    ViewStore = new ViewStore();
    ViewAdvertisement = new ViewAdvertisement();
    StoreItems: StoreItem[];

    private onStoreChange() {
        NotifyViewers({ ListenerName: TwitchListeners.onStoreChange, data: undefined })
    }

    async setAllCommands() {
        this.ViewStore.onAddStoreItemSondActive = async () => {
            await BackendConnections.SendToStoreManager(this.Token,
                this.ViewStore.addStoreItem(
                    new StoreItem(null, StoreTypes.Audio, null, [new ItemSetting('SingleReproduction', false), new ItemSetting('AudioVolume', false, 100)], null, null)));
        }
        this.ViewStore.onStoreTypeActive = async (ViewStoreItemActived, ViewStoreType) => {
            if (!ViewStoreItemActived.FileName) return;
            this.ViewStore.ViewStoreItems.forEach(ViewStoreItem => {
                if (ViewStoreItem !== ViewStoreItemActived) {
                    ViewStoreItem.ViewStoreType.setHide();
                }
            });
            if (ViewStoreType.InDemo) {
                ViewStoreType.setHide();
                this.ViewStore.HTML_DemoAudioPlayer.pause();
            } else {
                ViewStoreType.setInDemo();
                this.ViewStore.HTML_DemoAudioPlayer.src = BackendConnections.getUrlOfFile(
                    this.StreamerID,
                    FolderTypes.StoreItem + ViewStoreItemActived.id,
                    ViewStoreItemActived.FileName);

                this.ViewStore.HTML_DemoAudioPlayer.volume = ViewStoreItemActived.ItemsSettings[ViewStoreItemActived.ItemsSettings.findIndex((ViewSettingsOfIten) => { return (ViewSettingsOfIten.DonorFeatureName === 'AudioVolume') })].value / 100;
                this.ViewStore.HTML_DemoAudioPlayer.play();
            }
        }
        this.ViewStore.onDescriptionChange = (ViewStoreItem) => {
            ViewStoreItem.DescriptionInput.setChangedInput();
            BackendConnections.SendToStoreManager(this.Token, <StoreItem>ViewStoreItem)
                .then(async () => {
                    ViewStoreItem.DescriptionInput.setInputSentSuccessfully();
                    await sleep(500);
                    ViewStoreItem.DescriptionInput.setUnchangedInput();
                    this.onStoreChange();

                })
                .catch((rej) => {
                    console.error(rej);
                    ViewStoreItem.DescriptionInput.setInputSentError();
                })
        }
        this.ViewStore.onPriceChange = (ViewStoreItem) => {
            ViewStoreItem.PriceInput.setChangedInput();
            BackendConnections.SendToStoreManager(this.Token, <StoreItem>ViewStoreItem)
                .then(async () => {
                    ViewStoreItem.PriceInput.setInputSentSuccessfully();
                    await sleep(500);
                    ViewStoreItem.PriceInput.setUnchangedInput();
                    this.onStoreChange();
                })
                .catch((rej) => {
                    console.error(rej);
                    ViewStoreItem.PriceInput.setInputSentError();
                })
        }
        this.ViewStore.onSettingOfItemChange = (ViewStoreItem, ItemSettings) => {
            if (ItemSettings.DonorFeatureName === 'AudioVolume') {
                this.ViewStore.HTML_DemoAudioPlayer.volume = ItemSettings.value / 100;
                this.ViewStore.HTML_DemoAudioPlayer.currentTime = 0;
            }

            BackendConnections.SendToStoreManager(this.Token, ViewStoreItem)
                .then(() => this.onStoreChange())
                .catch((rej) => {
                    if (ItemSettings.DonorFeatureName === 'SingleReproduction') {
                        ViewStoreItem.SingleReproductionSetting.HTML_Input.checked = false;
                        ItemSettings.Enable = false;

                        ViewAdvertisement.Show();
                    }
                })
        }
        this.ViewStore.onFileInputChange = async (ViewStoreItem) => {
            let file = ViewStoreItem.ResponsiveInputFile.HTML_InputFile.files[0];
            if (file) {
                switch (ViewStoreItem.Type) {
                    case StoreTypes.Audio:
                        if (!(file.type === 'audio/mp3' || file.type === 'audio/wav'))
                            return reject({ typeEror: file.type })

                    default:
                        break;
                }
                ViewStoreItem.ResponsiveInputFile.setInUpload();

                let ioListener = (UploadPercentage: number) => {
                    ViewStoreItem.ResponsiveInputFile.setUploadPorcentage(UploadPercentage);
                }

                STREAMER_SOCKET.addEventListener(IOListeners.UploadProgress, ioListener);

                BackendConnections.UploadFile(this.Token, FolderTypes.StoreItem + ViewStoreItem.id, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    let StoreItem = <StoreItem>ViewStoreItem;
                    StoreItem.FileName = UploadFileResponse.FileName;
                    await BackendConnections.SendToStoreManager(this.Token, StoreItem);

                    ViewStoreItem.ResponsiveInputFile.setUpgradeable();
                    STREAMER_SOCKET.removeEventListener(IOListeners.UploadProgress, ioListener);

                    this.onStoreChange();
                }
                ).catch(rej => console.error(rej))
            }
        }
        this.ViewStore.onButtonDeleteActive = async (StoreItem) => {

            BackendConnections.DeteleStoreItem(this.Token, StoreItem)
                .then(() => {
                    this.onStoreChange();
                    this.ViewStore.removeStoreItem(StoreItem)
                })
                .catch((error) => {
                    console.error(error);
                })
        }
    }

    async loadingStoreItems() {
        this.StoreItems = await BackendConnections.GetStore(this.StreamerID);
        this.StoreItems.forEach(StoreItem => this.ViewStore.addStoreItem(StoreItem));
        this.setAllCommands();
    }
    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.loadingStoreItems();
    }
}
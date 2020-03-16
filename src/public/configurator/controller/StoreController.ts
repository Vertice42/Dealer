import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/utils";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import StoreItem, { StoreTypes } from "../../../services/models/store/StoreItem";
import ViewStore, { ViewStoreItem } from "../view/ViewStore";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";
import TwitchListeners from "../../../services/TwitchListeners";
import { NotifyViewers } from "./MainController";
import { reject } from "bluebird";
import FolderTypes from "../../../services/models/files_manager/FolderTypes";

export default class StoreController {
    StreamerID: string;
    ViewStore = new ViewStore();
    //TODO CHANGE to josineditaleble file
    StoreItems: StoreItem[];

    private onStoreChange() {
        NotifyViewers({ ListenerName: TwitchListeners.onStoreChaneg, data: undefined })
    }

    async setAllCommands() {
        this.ViewStore.onAddStoreItemSondActive = async () => {
            await BackendConnections.SendToStoreManager(this.StreamerID,
                this.ViewStore.addStoreItem(
                    new StoreItem(null, StoreTypes.Audio, null, [new ItemSetting('SingleReproduction', false)], null, null)));
        }
        this.ViewStore.onStoreTypeActive = async (ViewStoreItemActived, ViewStoreType) => {
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

                this.ViewStore.HTML_DemoAudioPlayer.play();
            }
        }
        this.ViewStore.onDescriptionChange = (ViewStoreItem) => {
            ViewStoreItem.DescriptionInput.setChangedInput();
            BackendConnections.SendToStoreManager(this.StreamerID, <StoreItem>ViewStoreItem)
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
            BackendConnections.SendToStoreManager(this.StreamerID, <StoreItem>ViewStoreItem)
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
                this.ViewStore.HTML_DemoAudioPlayer.volume = ItemSettings.value/100;
            }
            BackendConnections.SendToStoreManager(this.StreamerID, ViewStoreItem)
                .then(() => this.onStoreChange())
        }
        this.ViewStore.onFileInputChange = async (ViewStoreItem) => {
            let file = ViewStoreItem.HTML_InputFile.files[0];
            if (file) {
                switch (ViewStoreItem.Type) {
                    case StoreTypes.Audio:
                        if (!(file.type === 'audio/mp3' || file.type === 'audio/wav'))
                            return reject({ typeEror: file.type })

                    default:
                        break;
                }

                BackendConnections.UploadFile(this.StreamerID, FolderTypes.StoreItem + ViewStoreItem.id, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    let StoreItem = <StoreItem>ViewStoreItem;
                    StoreItem.FileName = UploadFileResponse.FileName;
                    await BackendConnections.SendToStoreManager(this.StreamerID, StoreItem);
                    ViewStoreItem.ResponsiveInputFile.setUpgradeable();
                    this.onStoreChange();
                }
                ).catch(rej => console.error(rej))
            }
        }
        this.ViewStore.onButtonDeleteActive = async (StoreItem) => {

            BackendConnections.DeteleStoreItem(this.StreamerID, StoreItem)
                .then(() => {
                    this.onStoreChange();
                    this.ViewStore.removeStoreItem(StoreItem)
                })
                .catch((rej) => {
                    //TODO ADD VIEW ERROR
                })
        }
    }

    async loadingStoreItems() {
        this.StoreItems = await BackendConnections.GetStore(this.StreamerID);
        this.StoreItems.forEach(StoreItem => this.ViewStore.addStoreItem(StoreItem));
        this.setAllCommands();
    }
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.loadingStoreItems()
    }
}
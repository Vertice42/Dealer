import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import StoreItem, { StoreTypes, getItemsSetting } from "../../../services/models/store/StoreItem";
import ViewStoreManager from "../view/ViewStore";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";
import TwitchListeners from "../../../services/models/listeners/TwitchListeners";
import { NotifyViewers, STREAMER_SOCKET } from "./MainController";
import { reject } from "bluebird";
import FolderTypes from "../../../services/models/files_manager/FolderTypes";
import { ViewAdvertisement } from "../view/ViewAdvertising";
import IOListeners from "../../../services/models/listeners/IOListeners";
import { updateStoreItem, DeleteStoreItem, GetStore } from "../../common/BackendConnection/Store";
import { getUrlOfFile, UploadFile } from "../../common/BackendConnection/BlobFiles";
import { sleep } from "../../../services/utils/functions";

/**
 * Connects the streamer actions to the back end to manage your Store
 */
export default class StoreController {
    private StreamerID: string;
    private Token: string;

    private ViewStore = new ViewStoreManager();
    private StoreItems: StoreItem[];

    private onStoreChange() {
        NotifyViewers({ ListenerName: TwitchListeners.onStoreChange, data: undefined })
    }

    private async setListeners() {
        this.ViewStore.onAddStoreItemSoundActive = async () => {
            await updateStoreItem(this.Token,
                this.ViewStore.addViewStoreItem(new StoreItem(null, StoreTypes.Audio,
                    null, [new ItemSetting('SingleReproduction', false),
                    new ItemSetting('AudioVolume', false, 100)], null, null)));
        }
        this.ViewStore.onStoreTypeActive = async (ViewStoreItemActive, ViewStoreType) => {
            if (!ViewStoreItemActive.FileName) return;
            this.ViewStore.ViewStoreItems.forEach(ViewStoreItem => {
                if (ViewStoreItem !== ViewStoreItemActive) {
                    ViewStoreItem.ViewStoreType.setHide();
                }
            });
            if (ViewStoreType.InDemo) {
                ViewStoreType.setHide();
                this.ViewStore.HTML_DemoAudioPlayer.pause();
            } else {
                ViewStoreType.setInDemo();
                this.ViewStore.HTML_DemoAudioPlayer.src = getUrlOfFile(
                    this.StreamerID,
                    FolderTypes.StoreItem + ViewStoreItemActive.id,
                    ViewStoreItemActive.FileName);

                this.ViewStore.HTML_DemoAudioPlayer.volume = getItemsSetting('AudioVolume', ViewStoreItemActive.ItemsSettings).value / 100;
                this.ViewStore.HTML_DemoAudioPlayer.play();
            }
        }
        this.ViewStore.onDescriptionChange = (ViewStoreItem) => {
            ViewStoreItem.DescriptionInput.setChangedInput();
            updateStoreItem(this.Token, <StoreItem>ViewStoreItem)
                .then(async () => {
                    ViewStoreItem.DescriptionInput.setInputSuccessfully();
                    await sleep(500);
                    ViewStoreItem.DescriptionInput.setUnchangedInput();
                    this.onStoreChange();

                })
                .catch((rej) => {
                    console.error(rej);
                    ViewStoreItem.DescriptionInput.setInputError();
                })
        }
        this.ViewStore.onPriceChange = (ViewStoreItem) => {
            ViewStoreItem.PriceInput.setChangedInput();
            updateStoreItem(this.Token, <StoreItem>ViewStoreItem)
                .then(async () => {
                    ViewStoreItem.PriceInput.setInputSuccessfully();
                    await sleep(500);
                    ViewStoreItem.PriceInput.setUnchangedInput();
                    this.onStoreChange();
                })
                .catch((rej) => {
                    console.error(rej);
                    ViewStoreItem.PriceInput.setInputError();
                })
        }
        this.ViewStore.onSettingOfItemChange = (ViewStoreItem, ItemSettings) => {
            if (ItemSettings.DonorFeatureName === 'AudioVolume') {
                this.ViewStore.HTML_DemoAudioPlayer.volume = ItemSettings.value / 100;
                this.ViewStore.HTML_DemoAudioPlayer.currentTime = 0;
            }

            updateStoreItem(this.Token, ViewStoreItem)
                .then(() => this.onStoreChange())
                .catch((rej: Response) => {
                    if (ItemSettings.DonorFeatureName === 'SingleReproduction') {
                        ViewStoreItem.SingleReproductionSetting.HTML_Input.checked = false;
                        ItemSettings.Enable = false;

                        if (rej.status === 423) ViewAdvertisement.Show();
                    }
                })
        }
        this.ViewStore.onFileInputChange = async (ViewStoreItem) => {
            let file = ViewStoreItem.ResponsiveInputFile.HTML_InputFile.files[0];
            if (file) {
                switch (ViewStoreItem.Type) {
                    case StoreTypes.Audio:
                        if (!(file.type === 'audio/mp3' ||
                            file.type === 'audio/wav' ||
                            file.type === 'audio/mpeg'))
                            throw { typeError: file.type };

                    default:
                        break;
                }
                ViewStoreItem.ResponsiveInputFile.setInUpload();
                ViewStoreItem.ResponsiveInputFile.setUploadPercentage(0);

                let ioListener = (UploadPercentage: number) => {
                    ViewStoreItem.ResponsiveInputFile.setUploadPercentage(UploadPercentage);
                }

                STREAMER_SOCKET.addEventListener(IOListeners.UploadProgress, ioListener);

                UploadFile(this.Token, FolderTypes.StoreItem + ViewStoreItem.id, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    let StoreItem = <StoreItem>ViewStoreItem;
                    StoreItem.FileName = UploadFileResponse.FileName;
                    await updateStoreItem(this.Token, StoreItem);

                    ViewStoreItem.ResponsiveInputFile.setUpgradeable();
                    STREAMER_SOCKET.removeEventListener(IOListeners.UploadProgress, ioListener);

                    this.onStoreChange();
                }
                ).catch(rej => console.error(rej))
            }
        }
        this.ViewStore.onButtonDeleteActive = async (StoreItem) => {

            DeleteStoreItem(this.Token, StoreItem)
                .then(() => {
                    this.onStoreChange();
                    this.ViewStore.removeStoreItem(StoreItem)
                })
                .catch((error) => {
                    console.error(error);
                })
        }
    }

    private async loadingStoreItems() {

        this.StoreItems = (await GetStore(this.StreamerID));

        this.StoreItems.forEach((StoreItem: StoreItem) => {
            this.ViewStore.addViewStoreItem(StoreItem)
        });
        this.setListeners();
    }
    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.loadingStoreItems();
    }
}
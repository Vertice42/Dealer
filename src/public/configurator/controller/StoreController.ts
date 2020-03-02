import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/utils";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import StoreItem from "../../../services/models/store/StoreItem";
import ViewStore from "../view/ViewStore";
import ItemSettings from "../../../services/models/store/ItemSettings";
import TwitchListeners from "../../../services/TwitchListeners";
import { NotifyViewers } from "./MainController";

export default class StoreController {
    StreamerID: string;
    ViewStore = new ViewStore([new ItemSettings(
        'SingleReproduction',
        false)
    ]);

    //TODO CHANGE to josineditaleble file
    StoreItems: StoreItem[];

    private onStoreChange() {
        NotifyViewers({ ListenerName: TwitchListeners.onStoreChaneg, data: undefined })
    }

    async EnbleAllCommands() {
        this.ViewStore.onAddStoreItemActive = () => {
            this.ViewStore.addStoreItem(null);
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
                    console.log(rej);
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
                    console.log(rej);
                    ViewStoreItem.PriceInput.setInputSentError();
                })
        }
        this.ViewStore.StoreItems.forEach(StoreItem => {
            StoreItem.ViewSettingsOfItens.forEach(ViewSettingsOfIten => {
                ViewSettingsOfIten.HTML.onchange = () => {
                    ViewSettingsOfIten.ItemSettings.Enable = ViewSettingsOfIten.HTML.checked;
                    StoreItem.ItemsSettings[ViewSettingsOfIten.id] = ViewSettingsOfIten.ItemSettings;
                    BackendConnections.SendToStoreManager(this.StreamerID, StoreItem)
                        .then(() => {
                            this.onStoreChange();
                        })
                        .catch((rej) => {
                            ViewSettingsOfIten.HTML.checked = (!ViewSettingsOfIten.HTML.checked);
                            ViewSettingsOfIten.HTML.classList.add('Error');
                        })
                }
            })
        })

        this.ViewStore.onFileInputChange = async (ViewStoreItem) => {
            let file = ViewStoreItem.HTML_InputFile.files[0];
            if (file) {
                BackendConnections.UploadFile(this.StreamerID, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    let StoreItem = <StoreItem>ViewStoreItem;
                    StoreItem.FileName = UploadFileResponse.FileName;
                    await BackendConnections.SendToStoreManager(this.StreamerID, StoreItem);
                    ViewStoreItem.ResponsiveInputFile.setUpgradeable();
                    this.onStoreChange();
                }
                ).catch(rej => console.log(rej))
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
        this.StoreItems = await BackendConnections.GetStore(this.StreamerID, -1);//ALL Items === -1        
        this.StoreItems.forEach(StoreItem => this.ViewStore.addStoreItem(StoreItem));
        this.EnbleAllCommands();
    }
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.loadingStoreItems()
    }
}
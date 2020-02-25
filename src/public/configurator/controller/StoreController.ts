import ViewConfig = require("../View");
import BackendConnections = require("../../BackendConnection");
import { sleep } from "../../../utils/utils";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import StoreItem from "../../../services/models/store/StoreItem";

export default class StoreController {
    StreamerID: string;
    ViewStore = new ViewConfig.ViewStore;
    StoreItems: StoreItem[];

    async EnbleAllCommands() {

        this.ViewStore.onDescriptionChange = (ViewStoreItem) => {
            ViewStoreItem.DescriptionInput.setChangedInput();
            BackendConnections.SendToStoreManager(this.StreamerID, <StoreItem>ViewStoreItem)
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
        this.ViewStore.onPriceChange = (ViewStoreItem) => {
            ViewStoreItem.PriceInput.setChangedInput();
            BackendConnections.SendToStoreManager(this.StreamerID, <StoreItem>ViewStoreItem)
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
        this.ViewStore.onAddStoreItemActive = () => {
            this.ViewStore.addStoreItem(null);
        }
        this.ViewStore.onFileInputChange = async (ViewStoreItem) => {
            let file = ViewStoreItem.HTML_InputFile.files[0];
            if (file) {
                BackendConnections.UploadFile(this.StreamerID, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    let StoreItem = <StoreItem>ViewStoreItem;
                    StoreItem.FileName = UploadFileResponse.FileName;
                    await BackendConnections.SendToStoreManager(this.StreamerID, StoreItem);
                    ViewStoreItem.ResponsiveInputFile.setUpgradeable();
                }
                ).catch(rej => console.log(rej))
            }
        }
        this.ViewStore.onButtonDeleteActive = async (StoreItem) => {
            await BackendConnections.DeteleStoreItem(this.StreamerID, StoreItem)
            this.ViewStore.removeStoreItem(StoreItem)
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
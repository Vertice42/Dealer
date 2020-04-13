import { MinerSettings } from "../../../services/models/streamer_settings/MinerSettings";
import { sleep } from "../../../utils/functions";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import ViewSettings from "../view/ViewSettings";
import { NotifyViewers } from "./MainController";
import TwitchListeners from "../../../services/TwitchListeners";
import { ManagerMiner, GetMinerSettings } from "../../common/BackendConnection/Miner";
import { MinerManagerRequest } from "../../../services/models/miner/MinerManagerRequest";
import { ManagerCoinsSettings, GetCoinsSettings } from "../../common/BackendConnection/Coins";
import { CoinsSettingsManagerRequest } from "../../../services/models/streamer_settings/CoinsSettingsManagerRequest";
import { UploadFile, getUrlOfFile } from "../../common/BackendConnection/BlobFiles";

/**
 * Controls streamer back-end connections to manage extension settings
 */
export default class SettingsController {
    private StreamerID: string;
    private Token: string;

    private ViewSettings = new ViewSettings;
    private MinerSettings: MinerSettings;
    private CoinsSettings: CoinsSettings;

    private setListeners() {
        this.ViewSettings.HourlyRewardInput.HTML.onchange = () => {
            this.ViewSettings.HourlyRewardInput.setChangedInput();
            ManagerMiner(new MinerManagerRequest(this.Token, new MinerSettings
                (Number(this.ViewSettings.HourlyRewardInput.HTML.value) / 60)))
                .then(async () => {
                    this.ViewSettings.HourlyRewardInput.setInputSuccessfully();
                    await sleep(100);
                    this.ViewSettings.HourlyRewardInput.setUnchangedInput();
                })
                .catch(() => {
                    this.ViewSettings.HourlyRewardInput.setInputError();
                })
        }
        this.ViewSettings.CoinNameInput.HTML.onchange = async () => {
            this.ViewSettings.CoinNameInput.setChangedInput();
            this.CoinsSettings.CoinName = this.ViewSettings.CoinNameInput.HTML.value;
            ManagerCoinsSettings(new CoinsSettingsManagerRequest(this.Token, this.CoinsSettings))
                .then(async () => {
                    this.ViewSettings.CoinNameInput.setInputSuccessfully();
                    await sleep(100);
                    this.ViewSettings.CoinNameInput.setUnchangedInput();
                    NotifyViewers({ ListenerName: TwitchListeners.onCoinNameChange, data: this.CoinsSettings.CoinName })
                })
                .catch(() => {
                    this.ViewSettings.CoinNameInput.setInputError();
                })
        }
        this.ViewSettings.InputCoinImg.onchange = () => {
            let file = this.ViewSettings.InputCoinImg.files[0]
            if (file) {
                UploadFile(this.Token, 'CoinImage', file.name, file)
                    .then(async (UploadFileResponse: UploadFileResponse) => {
                        this.CoinsSettings.FileNameOfCoinImage = file.name;
                        ManagerCoinsSettings(new CoinsSettingsManagerRequest(this.Token, this.CoinsSettings))
                        this.ViewSettings.setCoinIMG(getUrlOfFile(this.StreamerID, 'CoinImage', this.CoinsSettings.FileNameOfCoinImage))
                    })
                    .catch(rej => console.error(rej))
            }
        }
    }
    private async LoadingSettings() {

        this.MinerSettings = await GetMinerSettings(this.StreamerID);
        this.CoinsSettings = await GetCoinsSettings(this.StreamerID);

        this.ViewSettings.HourlyRewardInput.HTML.value = (~~(this.MinerSettings.RewardPerMinute * 60)).toString();

        this.ViewSettings.CoinNameInput.HTML.value = this.CoinsSettings.CoinName;

        if (this.CoinsSettings.FileNameOfCoinImage)
            this.ViewSettings.setCoinIMG(getUrlOfFile(this.StreamerID, 'CoinImage', this.CoinsSettings.FileNameOfCoinImage))

        this.setListeners();
    }

    constructor(Token: string, StreamerID: string) {
        this.Token = Token;
        this.StreamerID = StreamerID;
        this.LoadingSettings();
    }
}
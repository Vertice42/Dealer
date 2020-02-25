import ViewConfig = require("../View");
import BackendConnections = require("../../BackendConnection");
import { MinerSettings } from "../../../services/models/miner/MinerSettings";
import { sleep } from "../../../utils/utils";
import UploadFileResponse from "../../../services/models/files_manager/UploadFileResponse";
import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";


export default class SettingsController {
    StreamerID: string;
    ViewSettings: ViewConfig.ViewSettings;
    MinerSettings: MinerSettings;
    CoinsSettings: CoinsSettings;

    EnbleAllCommands() {
        this.ViewSettings.HourlyRewardInput.HTMLInput.onchange = () => {
            this.ViewSettings.HourlyRewardInput.setChangedInput();
            BackendConnections.SendToMinerManager(this.StreamerID,
                new MinerSettings(Number(this.ViewSettings.HourlyRewardInput.HTMLInput.value) / 60))
                .then(async () => {
                    this.ViewSettings.HourlyRewardInput.setInputSentSuccessfully();
                    await sleep(100);
                    this.ViewSettings.HourlyRewardInput.setUnchangedInput();
                }).catch(() => {
                    this.ViewSettings.HourlyRewardInput.setInputSentError();
                })
        }
        this.ViewSettings.CoinNameInput.HTMLInput.onchange = async () => {
            this.ViewSettings.CoinNameInput.setChangedInput();
            this.CoinsSettings.CoinName = this.ViewSettings.CoinNameInput.HTMLInput.value;
            BackendConnections.SendToCoinsSettingsManager(this.StreamerID, this.CoinsSettings)
                .then(async () => {
                    this.ViewSettings.CoinNameInput.setInputSentSuccessfully();
                    await sleep(100);
                    this.ViewSettings.CoinNameInput.setUnchangedInput();
                }).catch(() => {
                    this.ViewSettings.CoinNameInput.setInputSentError();
                })
        }
        this.ViewSettings.InputCoinImg.onchange = () => {
            let file = this.ViewSettings.InputCoinImg.files[0]
            if (file) {
                BackendConnections.UploadFile(this.StreamerID, file.name, file
                ).then(async (UploadFileResponse: UploadFileResponse) => {
                    this.CoinsSettings.FileNameOfCoinImage = file.name;
                    BackendConnections.SendToCoinsSettingsManager(this.StreamerID, this.CoinsSettings)
                    this.ViewSettings.setCoinIMG(BackendConnections.getUrlOfFile(this.StreamerID, this.CoinsSettings.FileNameOfCoinImage))
                }
                ).catch(rej => console.log(rej))
            }
        }
    }
    async LoadingSettings() {
        this.ViewSettings = new ViewConfig.ViewSettings;

        this.MinerSettings = await BackendConnections.GetMinerSettings(this.StreamerID);
        this.CoinsSettings = await BackendConnections.GetCoinsSettings(this.StreamerID);

        this.ViewSettings.HourlyRewardInput.HTMLInput.value = (~~(this.MinerSettings.RewardPerMinute * 60)).toString();
        
        this.ViewSettings.CoinNameInput.HTMLInput.value = this.CoinsSettings.CoinName;
        this.ViewSettings.setCoinIMG(BackendConnections.getUrlOfFile(this.StreamerID, this.CoinsSettings.FileNameOfCoinImage))

        this.EnbleAllCommands();
    }

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.LoadingSettings();
    }
}
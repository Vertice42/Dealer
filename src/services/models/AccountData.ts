import { PollStatus } from "./poll/PollStatus";
import { dbButton as dbButton } from "./poll/dbButton";
import { dbBettings } from "./poll/dbBettings";
import { dbWallet } from "./poll/dbWallet";
import { dbSettings } from "./poll/dbSettings";
import { MinerSettings } from "./miner/MinerSettings";
import { Sequelize } from "sequelize";
import { dbStreamerManager } from "../modules/database/dbStreamerManager";
import { CoinsSettings } from "./streamer_settings/CoinsSettings";
import { dbFiles } from "./poll/dbFiles";
import { dbStore } from "./store/dbStore";
export class AccountData {
    CurrentPollStatus: PollStatus;

    StreamerID: string;
    CurrentPollID: string;
    CurrentBettingsID: string;

    dbStreamer: Sequelize;
    dbCurrentPollButtons: typeof dbButton;
    dbCurrentBettings: typeof dbBettings;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbSettings;
    dbFiles: typeof dbFiles;
    dbStore: typeof dbStore;

    MinerSettings: MinerSettings;
    CoinsSettings: CoinsSettings;

    LastUpdate: number;
    LossDistributor: number;
    
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.dbStreamer = dbStreamerManager.getStreamerDataBase(StreamerID);
        this.dbCurrentPollButtons = null;
        this.dbCurrentBettings = null;
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.CurrentPollID = null;
        this.CurrentBettingsID = null;
        this.CurrentPollStatus = null;
        this.LastUpdate = null;
    }
}

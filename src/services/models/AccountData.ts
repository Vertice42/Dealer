import { PollStatus } from "./poll/PollStatus";
import { dbButton as dbButton } from "./poll/dbButton";
import { dbBettings } from "./poll/dbBettings";
import { dbWallet } from "./poll/dbWallet";
import { dbSettings } from "./poll/dbSettings";
import { MinerSettings } from "./miner/MinerSettings";
import { Sequelize } from "sequelize";
import { dbStreamerManager } from "../modules/database/dbStreamerManager";
export class AccountData {
    dbStreamer: Sequelize;
    CurrentPollStatus: PollStatus;
    StreamerID: string;
    CurrentPollID: string;
    CurrentBettingsID: string;
    dbCurrentPollButtons: typeof dbButton;
    dbCurrentBettings: typeof dbBettings;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbSettings;
    MinerSettings: MinerSettings;
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

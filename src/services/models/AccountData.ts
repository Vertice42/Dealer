import { PollStatus } from "./poll/PollStatus";
import { dbButton as dbButton } from "./poll/dbButton";
import { dbBettings } from "./poll/dbBettings";
import { dbWallet } from "./poll/dbWallet";
import { dbSettings } from "./streamer_settings/dbSettings";
import { MinerSettings } from "./miner/MinerSettings";
import { Sequelize } from "sequelize";
import { dbStreamerManager } from "../modules/database/dbStreamerManager";
import { CoinsSettings } from "./streamer_settings/CoinsSettings";
import { dbStore } from "./store/dbStore";
import { dbPurchaseOrder } from "./store/dbPurchaseOrders";
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
    dbStore: typeof dbStore;
    dbPurchaseOrders: typeof dbPurchaseOrder;

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

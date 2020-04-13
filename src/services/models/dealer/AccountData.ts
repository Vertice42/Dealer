import { PollStatus } from "../poll/PollStatus";
import { dbButton as dbButton } from "../poll/dbButton";
import { dbBet } from "../poll/dbBetting";
import { dbWallet } from "../poll/dbWallet";
import { dbSettings } from "../streamer_settings/dbSettings";
import { MinerSettings } from "../streamer_settings/MinerSettings";
import { Sequelize } from "sequelize";
import { dbManager } from "../../modules/database/dbManager";
import { dbStoreItem } from "../store/dbStoreItem";
import { dbPurchaseOrder } from "../store/dbPurchaseOrders";
export class AccountData {
    CurrentPollStatus: PollStatus;

    StreamerID: string;
    CurrentPollID: string;
    CurrentBettingID: string;

    dbStreamer: Sequelize;
    dbCurrentPollButtons: typeof dbButton;
    dbCurrentBeatings: typeof dbBet;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbSettings;
    dbStore: typeof dbStoreItem;
    dbPurchaseOrders: typeof dbPurchaseOrder;

    MinerSettings: MinerSettings;

    LastUpdate: number;
    LossDistributor: number;
    
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.dbStreamer = dbManager.getStreamerDataBase(StreamerID);
        this.dbCurrentPollButtons = null;
        this.dbCurrentBeatings = null;
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.CurrentPollID = null;
        this.CurrentBettingID = null;
        this.CurrentPollStatus = null;
        this.LastUpdate = null;
    }
}

import { PollStatus } from "../poll/PollStatus";
import { dbPollButton as dbPollButton } from "../poll/dbButton";
import { dbBet } from "../poll/dbBets";
import { dbWallet } from "../poll/dbWallet";
import { dbSettings } from "../streamer_settings/dbSettings";
import { MinerSettings } from "../streamer_settings/MinerSettings";
import { Sequelize } from "sequelize";
import { dbManager } from "../../modules/database/dbManager";
import { dbStoreItem } from "../store/dbStoreItem";
import { dbPurchaseOrder } from "../store/dbPurchaseOrders";
import dbPollIndex from "../poll/dbPollIndex";
export class AccountData {
    StreamerID: string;
    dbStreamer: Sequelize;

    PollsIndexes: typeof dbPollIndex;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbSettings;
    dbStore: typeof dbStoreItem;
    dbPurchaseOrders: typeof dbPurchaseOrder;
    dbButtons: typeof dbPollButton;
    dbBets: typeof dbBet;

    LastPollID: number;
    LastPollStatus: PollStatus;

    MinerSettings: MinerSettings;

    LastUpdate: number;
    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
        this.dbStreamer = dbManager.getStreamerDataBase(StreamerID);
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.LastUpdate = null;
    }
}

import { PollStatus } from "../poll/PollStatus";
import { dbPollButton as dbPollButton } from "../poll/dbButton";
import { dbBet } from "../poll/dbBets";
import { dbWallet } from "../poll/dbWallet";
import { dbDealerSettings } from "../streamer_settings/dbSettings";
import { MinerSettings } from "../streamer_settings/MinerSettings";
import { Sequelize } from "sequelize";
import { dbStoreItem } from "../store/dbStoreItem";
import { dbPurchaseOrder } from "../store/dbPurchaseOrders";
import dbPollIndex from "../poll/dbPollIndex";
export class AccountData {
    StreamerID: string;

    dbPollsIndexes: typeof dbPollIndex;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbDealerSettings;
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
        this.dbWallets = null;
        this.dbSettings = null;
        this.MinerSettings = null;
        this.LastUpdate = null;
    }
}

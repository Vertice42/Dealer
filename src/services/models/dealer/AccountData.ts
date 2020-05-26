import { PollStatus } from "../poll/PollStatus";
import { dbPollButton as dbPollButton } from "../poll/dbButton";
import { dbBet } from "../poll/dbBets";
import { dbWallet } from "../poll/dbWallet";
import { dbDealerSettings } from "../streamer_settings/dbSettings";
import { MinerSettings } from "../streamer_settings/MinerSettings";
import { dbStoreItem } from "../store/dbStoreItem";
import { dbPurchaseOrder } from "../store/dbPurchaseOrders";
import dbPollIndex from "../poll/dbPollIndex";
export class AccountData {
    StreamerID: string;
    LastPollID: number;
    LastPollStatus: PollStatus;

    MinerSettings: MinerSettings;

    dbPollsIndexes: typeof dbPollIndex;
    dbWallets: typeof dbWallet;
    dbSettings: typeof dbDealerSettings;
    dbStore: typeof dbStoreItem;
    dbPurchaseOrders: typeof dbPurchaseOrder;
    dbButtons: typeof dbPollButton;
    dbBets: typeof dbBet;

    constructor(StreamerID: string) {
        this.StreamerID = StreamerID;
    }
}

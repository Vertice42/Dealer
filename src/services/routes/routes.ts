export const PollManagerRoute = '/PollManager';
export const GetPollRoute = '/Poll/:StreamerID';
export const getPollRoute = (StreamerID: string) => { return '/Poll/' + StreamerID };
export const AddBeatRoute = '/addBeat/:StreamerID/:TwitchUserID';
export const addBeatRoute = (StreamerID: string, TwitchUserID: string) => { return '/addBeat/' + StreamerID + '/' + TwitchUserID };
//POLL
export const MineCoinRoute = '/MinerCoin';
//MINER
export const PurchaseOrderRoute = '/BuyStoreItem'
export const GetPurchaseOrderRoute = '/PurchaseOrder/:StreamerID/:StoreItemID';
export const getPurchaseOrderRoute = (StreamerID: string, StoreItemID?: number) => {
    let storeItemID: string | number = '*';
    if (StoreItemID) storeItemID = StoreItemID;
    return '/PurchaseOrder/' + StreamerID + '/' + storeItemID
}
//PURCHASE_ORDER
export const StoreManagerRoute = '/StoreManager';
export const GetStoreRoute = '/Store/:StreamerID/:StoreItemID';
export const getStoreRoute = (StreamerID: string, StoreItemID: number) => { return '/Store/' + StreamerID + '/' + StoreItemID };
//STORE
export const MinerManagerRoute = '/MinerManager';
export const GetMinerSettingsRoute = '/MinerSettings/:StreamerID';
export const getMinerSettingsRoute = (StreamerID: string) => { return '/MinerSettings/' + StreamerID }

export const CoinsSettingsManagerRoute = '/CoinsSettingsManager/';
export const GetCoinsSettingsRoute = '/CoinsSettings/:StreamerID';
export const getCoinsSettingsRoute = (StreamerID: String) => { return '/CoinsSettings/' + StreamerID }
//SETTINGS
export const GetWalletRoute = '/Wallets/:StreamerID/:TwitchUserID'
export const getWalletRoute = (StreamerID: string, TwitchUserID = '*') => { return '/Wallets/' + StreamerID + '/' + TwitchUserID };
export const WalletManager = '/Wallets/';
//WALLETS
export const UploadFileRoute = '/UploadFile';
export const GetFileRoute = '/File/:StreamerID/:Folder/:FileName';
export const getFilesRoute = (StreamerID: string, Folder: string, FileName: string) => { return '/File/' + StreamerID + '/' + Folder + '/' + FileName }
//FILES

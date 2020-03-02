export default {
    PollManager: '/PollManager',
    getPoll: (StreamerID: string) => {
        return '/Poll/' + StreamerID;
    },
    GetPoll: '/Poll/:StreamerID',
    addVote: '/addVote/',
    MinerManager: '/MinerManager',
    getMiner: (StreamerID: string) => {
        return '/MinerSettings/' + StreamerID;
    },
    GetMinerSettings: '/MinerSettings/:StreamerID',
    MineCoin: '/MinerCoin',
    GetWallet: '/Wallet/:StreamerID/:TwitchUserID',
    getWallet: (StreamerID: string, TwitchUserID: string) => {
        return '/Wallet/' + StreamerID + '/' + TwitchUserID
    },
    GetWallets: '/Wallets/:StreamerID/:TwitchUserID',
    getWallets: (StreamerID: string,TwitchUserID?:string) => {
        return '/Wallets/' + StreamerID +'/' +TwitchUserID
    },
    GetCoinsSettings: '/CoinsSettings/:StreamerID',
    getCoinsSettings: (StreamerID: String) => {
        return '/CoinsSettings/' + StreamerID
    },
    CoinsSettingsManager: '/CoinsSettingsManager/',
    StoreManager: '/StoreManager',
    GetStore: '/Store/:StreamerID/:StoreItemID',
    getStore: (StreamerID: string, StoreItemID: number) => {
        return '/Store/' + StreamerID + '/' + StoreItemID;
    },
    PurchaseOrder: '/BuyStoreItem',
    GetPurchaseOrder: '/PurchaseOrder/:StreamerID',
    getPurchaseOrder: (StreamerID: string) => {
        return '/PurchaseOrder/' + StreamerID
    },
    WalletManager: '/Wallets/',
    UploadFile: '/UploadFile',
    GetFile: '/File/:StreamerID/:FileName',
    getFiles: (StreamerID: string, FileName: string) => {
        return '/File/' + StreamerID + '/' + FileName;
    }
}
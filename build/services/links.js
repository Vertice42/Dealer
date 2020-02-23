"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    PollManager: '/PollManager',
    getPoll: (StreamerID) => {
        return '/Poll/' + StreamerID;
    },
    GetPoll: '/Poll/:StreamerID',
    addVote: '/addVote/',
    MinerManager: '/MinerManager',
    getMiner: (StreamerID) => {
        return '/MinerSettings/' + StreamerID;
    },
    GetMinerSettings: '/MinerSettings/:StreamerID',
    MineCoin: '/MinerCoin',
    GetWallet: '/Wallet/:StreamerID/:TwitchUserID',
    getWallet: (StreamerID, TwitchUserID) => {
        return '/Wallet/' + StreamerID + '/' + TwitchUserID;
    },
    GetWallets: '/Wallets/:StreamerID/:TwitchUserID',
    getWallets: (StreamerID, TwitchUserID) => {
        return '/Wallets/' + StreamerID + '/' + TwitchUserID;
    },
    GetCoinsSettings: '/CoinsSettings/:StreamerID',
    getCoinsSettings: (StreamerID) => {
        return '/CoinsSettings/' + StreamerID;
    },
    CoinsSettingsManager: '/CoinsSettingsManager/',
    StoreManager: '/StoreManager',
    GetStore: '/Store/:StreamerID/:StoreItemID',
    getStore: (StreamerID, StoreItemID) => {
        return '/Store/' + StreamerID + '/' + StoreItemID;
    },
    PurchaseOrder: '/BuyStoreItem',
    GetPurchaseOrder: '/PurchaseOrder/:StreamerID',
    getPurchaseOrder: (StreamerID) => {
        return '/PurchaseOrder/' + StreamerID;
    },
    WalletManager: '/Wallets/',
    UploadFile: '/UploadFile',
    GetFile: '/File/:StreamerID/:FileName',
    getFiles: (StreamerID, FileName) => {
        return '/File/' + StreamerID + '/' + FileName;
    },
};

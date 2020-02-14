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
    GetCoinsSettings: '/CoinsSettings/:StreamerID',
    getCoinsSettings: (StreamerID) => {
        return '/CoinsSettings/' + StreamerID;
    },
    CoinsSettingsManager: '/CoinsSettingsManager/',
    StoreManager: '/StoreManager',
    GetStore: '/Store/:StreamerID',
    getStore: (StreamerID) => {
        return '/Store/' + StreamerID;
    },
    UploadFile: '/UploadFile'
};

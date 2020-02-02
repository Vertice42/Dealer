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
        return '/Miner/' + StreamerID;
    },
    GetSettings: '/Miner/:StreamerID',
    MineCoin: '/MinerCoin',
    GetWallet: '/Wallet/:StreamerID/:TwitchUserID',
    getWallet: (StreamerID, TwitchUserID) => {
        return '/Wallet/' + StreamerID + '/' + TwitchUserID;
    }
};

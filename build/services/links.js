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
    MinerCoin: '/MinerCoin'
};

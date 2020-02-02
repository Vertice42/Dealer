export default {
    PollManager: '/PollManager',
    getPoll: (StreamerID: string) => {
        return '/Poll/' + StreamerID;
    },
    GetPoll: '/Poll/:StreamerID',
    addVote: '/addVote/',
    MinerManager: '/MinerManager',
    getMiner: (StreamerID: string) => {
        return '/Miner/' + StreamerID;
    },
    GetSettings: '/Miner/:StreamerID',
    MineCoin: '/MinerCoin',
    GetWallet: '/Wallet/:StreamerID/:TwitchUserID',
    getWallet: (StreamerID: string, TwitchUserID: string) => {
        return '/Wallet/'+StreamerID+'/'+TwitchUserID
    }
}
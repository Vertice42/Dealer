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
    GetCoinsSettings: '/CoinsSettings/:StreamerID',
    getCoinsSettings: (StreamerID: String) => {
        return '/CoinsSettings/' + StreamerID
    },
    CoinsSettingsManager: '/CoinsSettingsManager/',
    StoreManager: '/StoreManager',
    GetStore: '/Store/:StreamerID',
    getStore: (StreamerID: string) => {
        return '/Store/' + StreamerID;
    },
    UploadFile:'/UploadFile',
    GetFile:'/File/:StreamerID/:FileName',
    getFile: (StreamerID:string,FileName:string) => {
        return '/File/'+StreamerID+'/'+FileName;
    }
}
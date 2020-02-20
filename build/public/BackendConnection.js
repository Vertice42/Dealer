"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("bluebird");
const Links_1 = require("../services/Links");
const ServerConfigs_1 = require("../services/configs/ServerConfigs");
const StoreManagerRequest_1 = require("../services/models/store/StoreManagerRequest");
const PurchaseOrderRequest_1 = require("../services/modules/database/store/PurchaseOrderRequest");
const DeletePurchaseOrderRequest_1 = require("../services/modules/database/store/DeletePurchaseOrderRequest");
exports.host = 'http://localhost:' + (ServerConfigs_1.default.Port || process.env.Port);
async function getCurrentPoll(StreamerID) {
    /* Use fetch to communicate to backend and get current voting */
    return fetch(exports.host + Links_1.default.getPoll(StreamerID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return res.json();
        else
            return bluebird_1.reject(res);
    }).catch((rej) => {
        console.log(rej);
        return rej.json().then((res) => { console.error(res); });
    });
}
exports.getCurrentPoll = getCurrentPoll;
class WatchPoll {
    constructor(StreamerID) {
        this.onWatch = null;
        this.onPollChange = null;
        this.Stop = null;
        this.LastUpdate = 0;
        this.StreamerID = StreamerID;
    }
    Watch() {
        getCurrentPoll(this.StreamerID).then((Poll) => {
            setTimeout(() => {
                if (!this.Stop) {
                    this.Watch();
                    if (this.onWatch)
                        this.onWatch(Poll);
                    if (this.LastUpdate !== Poll.LastUpdate) {
                        if (this.onPollChange)
                            this.onPollChange(Poll);
                        this.LastUpdate = Poll.LastUpdate;
                    }
                }
                else {
                    this.Stop = null;
                }
            }, 500);
        }).catch(() => {
            console.log('Error connecting to Service, next attempt in 3s');
            setTimeout(() => {
                if (!this.Stop)
                    this.Watch();
            }, 3000);
        });
    }
    start() {
        if (this.Stop === null)
            this.Watch();
        this.Stop = false;
        return this;
    }
    stop() {
        this.Stop = true;
        return this;
    }
    setOnPollChange(onPollChange) {
        this.onPollChange = onPollChange;
        return this;
    }
}
exports.WatchPoll = WatchPoll;
async function SendToPollManager(StreamerID, PollButtons, NewPollStatus) {
    /*Send current voting with your buttons and current poll status */
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.PollManager, {
        method: "POST",
        headers: H,
        body: JSON.stringify({
            StreamerID: StreamerID,
            NewPollStatus: NewPollStatus,
            PollButtons: PollButtons //TODO POR EM UM MODELODE DE REQUISIÇÃO
        })
    }).then((res) => {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json().then((res) => {
            return res;
        });
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            return bluebird_1.reject(res);
        });
    });
}
exports.SendToPollManager = SendToPollManager;
async function SendToMinerManager(StreamerID, Setting) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.MinerManager, {
        method: "POST",
        headers: H,
        body: JSON.stringify({
            StreamerID: StreamerID,
            Setting: Setting
        })
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            console.log(res);
            return bluebird_1.reject(res);
        });
    });
}
exports.SendToMinerManager = SendToMinerManager;
async function SendToCoinsSettingsManager(StreamerID, Setting) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.CoinsSettingsManager, {
        method: "POST",
        headers: H,
        body: JSON.stringify({
            StreamerID: StreamerID,
            Setting: Setting
        })
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            console.log(res);
            return bluebird_1.reject(res);
        });
    });
}
exports.SendToCoinsSettingsManager = SendToCoinsSettingsManager;
async function addBet(StreamerID, TwitchUserID, IdOfVote, BetAmount) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.addVote, {
        method: "POST",
        headers: H,
        body: JSON.stringify({
            StreamerID: StreamerID,
            TwitchUserID: TwitchUserID,
            Vote: IdOfVote,
            BetAmount: Number(BetAmount)
        })
    }).then(async function (res) {
        console.log(res.ok);
        if (res.ok)
            return bluebird_1.resolve(await res.json());
        else
            return bluebird_1.reject(await res.json());
    });
}
exports.addBet = addBet;
async function GetMinerSettings(StreamerID) {
    return fetch(exports.host + Links_1.default.getMiner(StreamerID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            console.log(res);
            return bluebird_1.reject(res);
        });
    });
}
exports.GetMinerSettings = GetMinerSettings;
async function GetCoinsSettings(StreamerID) {
    return fetch(exports.host + Links_1.default.getCoinsSettings(StreamerID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            console.log(res);
            return bluebird_1.reject(res);
        });
    });
}
exports.GetCoinsSettings = GetCoinsSettings;
async function MineCoin(StreamerID, TwitchUserID) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.MineCoin, {
        method: "POST",
        headers: H,
        body: JSON.stringify({
            StreamerID: StreamerID,
            TwitchUserID: TwitchUserID
        })
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            console.log(res);
            return bluebird_1.reject(res);
        });
    });
}
exports.MineCoin = MineCoin;
async function GetWallet(StreamerID, TwitchUserID) {
    return fetch(exports.host + Links_1.default.getWallet(StreamerID, TwitchUserID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res.json());
        else
            return bluebird_1.reject(res.json());
    }).catch((rej) => {
        console.log(rej);
    });
}
exports.GetWallet = GetWallet;
async function GetStore(StreamerID, StoreItemID) {
    return fetch(exports.host + Links_1.default.getStore(StreamerID, StoreItemID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res.json());
        else
            return bluebird_1.reject(res.json());
    }).catch((rej) => {
        console.log(rej);
    });
}
exports.GetStore = GetStore;
async function SendToStoreManager(StreamerID, StoreItem) {
    /*Send current voting with your buttons and current poll status */
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.StoreManager, {
        method: "POST",
        headers: H,
        body: JSON.stringify(new StoreManagerRequest_1.default(StreamerID, StoreItem))
    }).then((res) => {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json().then((res) => {
            return res;
        });
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            return bluebird_1.reject(res);
        });
    });
}
exports.SendToStoreManager = SendToStoreManager;
async function addPurchaseOrder(StreamerID, TwitchUserID, StoreItem) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.PurchaseOrder, {
        method: "POST",
        headers: H,
        body: JSON.stringify(new PurchaseOrderRequest_1.default(StreamerID, TwitchUserID, StoreItem.id))
    }).then((res) => {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json().then((res) => {
            return res;
        });
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            return bluebird_1.reject(res);
        });
    });
}
exports.addPurchaseOrder = addPurchaseOrder;
async function DeletePurchaseOrder(StreamerID, PurchaseOrder, Refund) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.PurchaseOrder, {
        method: "DELETE",
        headers: H,
        body: JSON.stringify(new DeletePurchaseOrderRequest_1.default(StreamerID, PurchaseOrder.TwitchUserID, PurchaseOrder.id, PurchaseOrder.StoreItemID, PurchaseOrder.SpentCoins, Refund))
    }).then((res) => {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json().then((res) => {
            return res;
        });
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            return bluebird_1.reject(res);
        });
    });
}
exports.DeletePurchaseOrder = DeletePurchaseOrder;
async function DeteleStoreItem(StreamerID, StoreItem) {
    /*Send current voting with your buttons and current poll status */
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(exports.host + Links_1.default.StoreManager, {
        method: "DELETE",
        headers: H,
        body: JSON.stringify(new StoreManagerRequest_1.default(StreamerID, StoreItem))
    }).then((res) => {
        if (res.ok)
            return bluebird_1.resolve(res);
        else
            return bluebird_1.reject(res);
    }).then((res) => {
        return res.json().then((res) => {
            return res;
        });
    }).catch((rej) => {
        return rej.json()
            .then((res) => {
            return bluebird_1.reject(res);
        });
    });
}
exports.DeteleStoreItem = DeteleStoreItem;
async function GetPurchaseOrders(StreamerID) {
    return fetch(exports.host + Links_1.default.getPurchaseOrder(StreamerID), {
        method: "GET"
    }).then(function (res) {
        if (res.ok)
            return bluebird_1.resolve(res.json());
        else
            return bluebird_1.reject(res.json());
    }).catch((rej) => {
        console.log(rej);
    });
}
exports.GetPurchaseOrders = GetPurchaseOrders;
async function UploadFile(StreamerID, FileName, File) {
    /*Send current voting with your buttons and current poll status */
    let headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append('streamer-id', StreamerID);
    headers.append("file-name", FileName);
    return fetch(exports.host + Links_1.default.UploadFile, {
        method: "POST",
        headers: headers,
        body: File
    }).catch((rej) => {
        console.log(rej);
        return rej.json();
    })
        .then((res) => {
        return res.json();
    });
}
exports.UploadFile = UploadFile;
function getUrlOfFile(StreamerID, FileName) {
    return exports.host + Links_1.default.getFiles(StreamerID, FileName);
}
exports.getUrlOfFile = getUrlOfFile;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("bluebird");
const Links_1 = require("../services/Links");
const ServerConfigs_1 = require("../services/configs/ServerConfigs");
const StoreManagerRequest_1 = require("../services/models/store/StoreManagerRequest");
const host = 'http://localhost:' + (ServerConfigs_1.default.Port || process.env.Port);
function getCurrentPoll(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        /* Use fetch to communicate to backend and get current voting */
        return fetch(host + Links_1.default.getPoll(StreamerID), {
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
function SendToPollManager(StreamerID, PollButtons, NewPollStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        /*Send current voting with your buttons and current poll status */
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.PollManager, {
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
    });
}
exports.SendToPollManager = SendToPollManager;
function SendToMinerManager(StreamerID, Setting) {
    return __awaiter(this, void 0, void 0, function* () {
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.MinerManager, {
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
    });
}
exports.SendToMinerManager = SendToMinerManager;
function SendToCoinsSettingsManager(StreamerID, Setting) {
    return __awaiter(this, void 0, void 0, function* () {
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.CoinsSettingsManager, {
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
    });
}
exports.SendToCoinsSettingsManager = SendToCoinsSettingsManager;
function addBet(StreamerID, TwitchUserID, IdOfVote, BetAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.addVote, {
            method: "POST",
            headers: H,
            body: JSON.stringify({
                StreamerID: StreamerID,
                TwitchUserID: TwitchUserID,
                Vote: IdOfVote,
                BetAmount: Number(BetAmount)
            })
        }).then(function (res) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(res.ok);
                if (res.ok)
                    return bluebird_1.resolve(yield res.json());
                else
                    return bluebird_1.reject(yield res.json());
            });
        });
    });
}
exports.addBet = addBet;
function GetMinerSettings(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(host + Links_1.default.getMiner(StreamerID), {
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
    });
}
exports.GetMinerSettings = GetMinerSettings;
function GetCoinsSettings(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(host + Links_1.default.getCoinsSettings(StreamerID), {
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
    });
}
exports.GetCoinsSettings = GetCoinsSettings;
function MineCoin(StreamerID, TwitchUserID) {
    return __awaiter(this, void 0, void 0, function* () {
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.MineCoin, {
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
    });
}
exports.MineCoin = MineCoin;
function GetWallet(StreamerID, TwitchUserID) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(host + Links_1.default.getWallet(StreamerID, TwitchUserID), {
            method: "GET"
        }).then(function (res) {
            if (res.ok)
                return bluebird_1.resolve(res.json());
            else
                return bluebird_1.reject(res.json());
        }).catch((rej) => {
            console.log(rej);
        });
    });
}
exports.GetWallet = GetWallet;
function GetStore(StreamerID) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(host + Links_1.default.getStore(StreamerID), {
            method: "GET"
        }).then(function (res) {
            if (res.ok)
                return bluebird_1.resolve(res.json());
            else
                return bluebird_1.reject(res.json());
        }).catch((rej) => {
            console.log(rej);
        });
    });
}
exports.GetStore = GetStore;
function SendToStoreManager(StreamerID, StoreItem) {
    return __awaiter(this, void 0, void 0, function* () {
        /*Send current voting with your buttons and current poll status */
        let H = new Headers();
        H.append("Content-Type", "application/json");
        return fetch(host + Links_1.default.StoreManager, {
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
    });
}
exports.SendToStoreManager = SendToStoreManager;

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
const express = require("express");
const BodyParcer = require("body-parser");
const cors = require("cors");
const bluebird_1 = require("bluebird");
const paths_1 = require("./paths");
const dbManeger_1 = require("./modules/database/dbManeger");
const PollManeger_1 = require("./modules/poll/PollManeger");
const MinerManeger_1 = require("./modules/miner/MinerManeger");
const app = express();
exports.app = app;
app.use(cors());
app.use(BodyParcer.urlencoded({ extended: false }));
app.use(BodyParcer.json());
function CheckRequisition(CheckList) {
    let ErrorList = [];
    CheckList.forEach(chekage => {
        let fail = chekage();
        if (fail)
            ErrorList.push(fail);
    });
    return ErrorList;
}
app.post(paths_1.default.PollManager, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        },
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "CurrentPollStatus is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    function ThereWinningButtons(PollButtons) {
        for (let i = 0; i < PollButtons.length; i++)
            if (PollButtons[i].IsWinner)
                return true;
        return false;
    }
    function manager(StreamerID, CurrentPollStatus, PollButtons) {
        return __awaiter(this, void 0, void 0, function* () {
            let AccountData = dbManeger_1.getAccountData(StreamerID);
            AccountData.LastUpdate = new Date().getTime();
            AccountData.CurrentPollStatus = CurrentPollStatus;
            if (!AccountData.dbCurrentPoll)
                return PollManeger_1.PollManeger.CreatePoll(StreamerID);
            else {
                return PollManeger_1.PollManeger.UpdatePoll(StreamerID, PollButtons)
                    .then((PoolUpdateRes) => __awaiter(this, void 0, void 0, function* () {
                    if (!CurrentPollStatus.PollWaxed &&
                        !CurrentPollStatus.DistributionStarted &&
                        CurrentPollStatus.InDistribution) {
                        if (ThereWinningButtons(PollButtons)) {
                            const DistributionRes = yield PollManeger_1.PollManeger.StartDistributeGainsAndLosses(StreamerID, PollButtons);
                            return bluebird_1.resolve({
                                Poll: PoolUpdateRes,
                                Distribution: DistributionRes
                            });
                        }
                        else {
                            return bluebird_1.reject({ RequestError: 'There is no winning button' });
                        }
                    }
                    return bluebird_1.resolve(PoolUpdateRes);
                }));
            }
        });
    }
    manager(req.body.StreamerID, req.body.CurrentPollStatus, req.body.PollButtons)
        .then((ManagerPollRes) => {
        res.status(200).send(ManagerPollRes);
    })
        .catch((reject) => {
        if (reject.RequestError)
            res.status(400).send(reject);
        else
            res.status(500).send(reject);
    });
});
app.get(paths_1.default.GetPoll, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    PollManeger_1.PollManeger.getCurrentPoll(req.params.StreamerID)
        .then((resolve) => {
        res.status(200).send(resolve);
    })
        .catch((reje) => {
        res.status(500).send(reje);
    });
});
app.post(paths_1.default.addVote, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        },
        () => {
            if (!req.body.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" });
        },
        () => {
            let mensage;
            if (!req.body.Vote && req.body.Vote !== 0)
                mensage = "Vote is no defined";
            else if (!Number.isInteger(req.body.Vote))
                mensage = "Vote is no defined";
            if (mensage)
                return { RequestError: mensage };
        },
        () => {
            let mensage;
            if (!req.body.BetAmount && req.body.BetAmount !== 0)
                mensage = "BetAmount is no defined";
            else if (!Number.isInteger(req.body.BetAmount))
                mensage = "BetAmount not is Integer";
            else if (req.body.BetAmount < 1)
                mensage = "BetAmount not is Valid";
            if (mensage)
                return { RequestError: mensage };
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    PollManeger_1.PollManeger.AddBet(req.body.TwitchUserID, req.body.StreamerID, req.body.Vote, req.body.BetAmount)
        .then((reso) => {
        res.status(200).send(reso);
    })
        .catch((reject) => {
        if (reject.RequestError)
            res.status(400).send(reject);
        else
            res.status(500).send(reject);
    });
});
app.post(paths_1.default.MinerManager, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        },
        () => {
            if (!req.body.Setting)
                return ({ RequestError: "Setting is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    MinerManeger_1.MinerManeger.UpdateSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso); })
        .catch((reje) => { res.status(500).send(reje); });
});
app.get(paths_1.default.GetMiner, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    MinerManeger_1.MinerManeger.getMinerSettings(req.params.StreamerID)
        .then((MinrSettings) => {
        res.status(200).send(MinrSettings);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(paths_1.default.MinerCoin, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        },
        () => {
            if (!req.body.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    MinerManeger_1.MinerManeger.MineCoin(req.body.TwitchUserID, req.body.StreamerID)
        .then((resolve) => { res.status(200).send(resolve); })
        .catch((reje) => { res.status(500).send(reje); });
});

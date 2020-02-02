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
const dbMinerManager_1 = require("./modules/database/miner/dbMinerManager");
const PollController_1 = require("./controller/PollController");
const dbStreamerManager_1 = require("./modules/database/dbStreamerManager");
const dbWalletManager_1 = require("./modules/database/miner/dbWalletManager");
const links_1 = require("./links");
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
function ThereWinningButtonsInArray(PollButtons) {
    for (let i = 0; i < PollButtons.length; i++)
        if (PollButtons[i].IsWinner)
            return true;
    return false;
}
app.post(links_1.default.PollManager, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            return res.status(400).send({ ErrorList });
        let pollController = new PollController_1.PollController(req.body.StreamerID);
        let PoolUpdateResult;
        let DistribuitionResult;
        let AccountData = dbStreamerManager_1.dbStreamerManager.getAccountData(req.body.StreamerID);
        if (AccountData.CurrentPollStatus.PollWaxed)
            return res.status(200).send(pollController.CreatePoll());
        else {
            if (req.body.NewPollStatus) {
                AccountData.CurrentPollStatus = req.body.NewPollStatus;
                PoolUpdateResult = yield pollController.UpdatePoll(req.body.PollButtons);
                if (AccountData.CurrentPollStatus.InDistribution &&
                    !AccountData.CurrentPollStatus.PollWaxed &&
                    !AccountData.CurrentPollStatus.DistributionStarted) {
                    if (ThereWinningButtonsInArray(req.body.PollButtons))
                        DistribuitionResult = yield pollController.StartDistribuition(req.body.PollButtons);
                    else
                        return res.status(500).send({ RequestError: 'There is no winning button' });
                }
            }
        }
        return res.status(200).send({ PoolUpdateResult, DistribuitionResult });
    });
});
app.get(links_1.default.GetPoll, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    let pollController = new PollController_1.PollController(req.params.StreamerID);
    pollController.getCurrentPoll()
        .then((resolve) => {
        res.status(200).send(resolve);
    })
        .catch((reje) => {
        res.status(500).send(reje);
    });
});
app.post(links_1.default.addVote, function (req, res) {
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
    let pollController = new PollController_1.PollController(req.body.StreamerID);
    pollController.AddBet(req.body.TwitchUserID, req.body.Vote, req.body.BetAmount)
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
app.post(links_1.default.MinerManager, function (req, res) {
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
    dbMinerManager_1.MinerManeger.UpdateSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso); })
        .catch((reje) => { res.status(500).send(reje); });
});
app.get(links_1.default.GetSettings, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    dbMinerManager_1.MinerManeger.getMinerSettings(req.params.StreamerID)
        .then((MinerSettings) => {
        res.status(200).send(MinerSettings);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(links_1.default.MineCoin, function (req, res) {
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
    dbMinerManager_1.MinerManeger.MineCoin(req.body.StreamerID, req.body.TwitchUserID)
        .then((resolve) => { res.status(200).send(resolve); })
        .catch((reje) => {
        res.status(500).send(reje);
        console.log(reje);
    });
});
app.get(links_1.default.GetWallet, function (req, res) {
    new dbWalletManager_1.WalletManeger(req.params.StreamerID, req.params.TwitchUserID)
        .getWallet().then((wallet) => {
        res.status(200).send(wallet);
    });
});

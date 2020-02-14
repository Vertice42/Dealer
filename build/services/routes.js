"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PollController_1 = require("./controller/PollController");
const dbStreamerManager_1 = require("./modules/database/dbStreamerManager");
const dbWalletManager_1 = require("./modules/database/miner/dbWalletManager");
const Links_1 = require("./Links");
const dbMinerManager_1 = require("./modules/database/miner/dbMinerManager");
const StreamerSettings_1 = require("./modules/database/streamer_settings/StreamerSettings");
const dbStoreManager_1 = require("./modules/database/store/dbStoreManager");
const fs = require("fs");
const http = require("http");
const Socket_io = require("socket.io");
const app = express();
exports.app = app;
const server = http.createServer(app);
const oi = Socket_io(server);
app.use(cors());
app.use(bodyParser.json());
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
app.post(Links_1.default.PollManager, async function (req, res) {
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
            PoolUpdateResult = await pollController.UpdatePoll(req.body.PollButtons);
            if (AccountData.CurrentPollStatus.InDistribution &&
                !AccountData.CurrentPollStatus.PollWaxed &&
                !AccountData.CurrentPollStatus.DistributionStarted) {
                if (ThereWinningButtonsInArray(req.body.PollButtons))
                    DistribuitionResult = await pollController.StartDistribuition(req.body.PollButtons);
                else
                    return res.status(500).send({ RequestError: 'There is no winning button' });
            }
        }
    }
    return res.status(200).send({ PoolUpdateResult, DistribuitionResult });
});
app.get(Links_1.default.GetPoll, function (req, res) {
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
app.post(Links_1.default.addVote, function (req, res) {
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
app.post(Links_1.default.MinerManager, function (req, res) {
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
    StreamerSettings_1.default.UpdateMinerSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso); })
        .catch((reje) => { res.status(500).send(reje); });
});
app.get(Links_1.default.GetMinerSettings, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettings_1.default.getMinerSettings(req.params.StreamerID)
        .then((MinerSettings) => {
        res.status(200).send(MinerSettings);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(Links_1.default.CoinsSettingsManager, function (req, res) {
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
    StreamerSettings_1.default.UpdateCoinsSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso); })
        .catch((reje) => { res.status(500).send(reje); });
});
app.get(Links_1.default.GetCoinsSettings, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettings_1.default.getCoinsSettings(req.params.StreamerID)
        .then((CoinsSettings) => {
        res.status(200).send(CoinsSettings);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(Links_1.default.MineCoin, function (req, res) {
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
    dbMinerManager_1.default.MineCoin(req.body.StreamerID, req.body.TwitchUserID)
        .then((resolve) => { res.status(200).send(resolve); })
        .catch((reje) => {
        res.status(500).send(reje);
    });
});
app.get(Links_1.default.GetWallet, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }, () => {
            if (!req.params.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    new dbWalletManager_1.dbWalletManeger(req.params.StreamerID, req.params.TwitchUserID)
        .getWallet()
        .then((wallet) => {
        res.status(200).send(wallet);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(Links_1.default.StoreManager, function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    new dbStoreManager_1.default(req.body.StreamerID).UpdateOrCreateStoreItem(req.body.StoreItem)
        .then((result) => {
        res.status(200).send(result);
    })
        .catch((reject) => {
        res.status(500).send(reject);
    });
});
app.get(Links_1.default.GetStore, function (req, res) {
    new dbStoreManager_1.default(req.params.StreamerID).getAllItens()
        .then((result) => {
        res.status(200).send(result);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.post(Links_1.default.UploadFile, function (req, res) {
    console.log(req.headers);
    let file = fs.createWriteStream("./uploads/" + req.headers["file-name"]);
    req.on('data', chunk => {
        file.write(chunk);
    });
    req.on('end', () => {
        file.end();
        res.status(200).send({ UploadCompleted: new Date });
    });
    console.log(req.headers["content-type"]);
});

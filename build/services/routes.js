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
const UploadFileResponse_1 = require("./models/files_manager/UploadFileResponse");
const path = require("path");
const PurchaseOrder_1 = require("./models/store/PurchaseOrder");
const dbPurchaseOrderManager_1 = require("./modules/database/store/dbPurchaseOrderManager");
const app = express();
const server = http.createServer(app);
const io = Socket_io(server).listen(server);
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
var Sockets = [];
function getSoketOfStreamer(StreamerID) {
    return Sockets[StreamerID];
}
io.on('connect', (socket) => {
    socket.on('registered', (StreamerID) => {
        Sockets[StreamerID] = socket;
    });
});
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
app.get(Links_1.default.GetPoll, async function (req, res) {
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
app.post(Links_1.default.addVote, async function (req, res) {
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
app.post(Links_1.default.MinerManager, async function (req, res) {
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
app.get(Links_1.default.GetMinerSettings, async function (req, res) {
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
app.post(Links_1.default.CoinsSettingsManager, async function (req, res) {
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
app.get(Links_1.default.GetCoinsSettings, async function (req, res) {
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
app.post(Links_1.default.MineCoin, async function (req, res) {
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
    //TODO ADICINADO MINIRAÇÃO MACIMA
});
app.get(Links_1.default.GetWallet, async function (req, res) {
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
app.post(Links_1.default.StoreManager, async function (req, res) {
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
app.delete(Links_1.default.StoreManager, async function (req, res) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" });
        }
    ]);
    if (ErrorList.length > 0)
        return res.status(400).send({ ErrorList: ErrorList });
    new dbStoreManager_1.default(req.body.StreamerID).DeleteStoreItem(req.body.StoreItem)
        .then((result) => {
        res.status(200).send(result);
    })
        .catch((reject) => {
        res.status(500).send(reject);
    });
});
app.get(Links_1.default.GetStore, async function (req, res) {
    let dbStoreM = new dbStoreManager_1.default(req.params.StreamerID);
    if (req.params.StoreItemID === '-1') {
        dbStoreM.getAllItens()
            .then((result) => {
            res.status(200).send(result);
        })
            .catch((rej) => {
            res.status(500).send(rej);
        });
    }
    else {
        dbStoreM.getIten(Number(req.params.StoreItemID))
            .then((result) => {
            res.status(200).send(result);
        })
            .catch((rej) => {
            res.status(500).send(rej);
        });
    }
});
app.post(Links_1.default.UploadFile, async function (req, res) {
    //TODO ON UPDATE REMOVER ANTIGO
    let dir = `./uploads/${req.headers["streamer-id"]}`;
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    let file = fs.createWriteStream(dir + '/' + req.headers["file-name"]);
    req.on('data', chunk => {
        file.write(chunk);
    });
    req.on('end', () => {
        file.end();
        res.status(200).send(new UploadFileResponse_1.default(req.headers["file-name"], new Date));
    });
});
app.get(Links_1.default.GetFile, async function (req, res) {
    res.status(200).sendFile(path.resolve(`./uploads/${req.params.StreamerID}/${req.params.FileName}`));
});
app.post(Links_1.default.PurchaseOrder, async function (req, res) {
    let PurchaseOrderRequest = req.body;
    //TODO add CheckRequisition
    let ItemPrice = (await new dbStoreManager_1.default(PurchaseOrderRequest.StreamerID).getIten(PurchaseOrderRequest.StoreItemID)).Price;
    let dbWalletM = new dbWalletManager_1.dbWalletManeger(PurchaseOrderRequest.StreamerID, PurchaseOrderRequest.TwitchUserID);
    if ((await dbWalletM.getWallet()).Coins < ItemPrice) {
        return res.status(400).send({ ErrorBuying: 'Insufficient funds' });
    }
    new dbPurchaseOrderManager_1.default(PurchaseOrderRequest.StreamerID)
        .addPurchaseOrder(new PurchaseOrder_1.default(ItemPrice, PurchaseOrderRequest.TwitchUserID, PurchaseOrderRequest.StoreItemID))
        .then(async (dbPurchaseOrder) => {
        await dbWalletM.withdraw(ItemPrice);
        getSoketOfStreamer(PurchaseOrderRequest.StreamerID).emit('PurchasedItem', dbPurchaseOrder);
        res.status(200).send({ PurchaseOrderWasSentSuccessfully: new Date });
    })
        .catch((rej) => {
        console.log(rej);
        res.status(500).send(rej);
    });
});
app.delete(Links_1.default.PurchaseOrder, async function (req, res) {
    let PurchaseOrder = req.body;
    new dbPurchaseOrderManager_1.default(PurchaseOrder.StreamerID)
        .removePurchaseOrder(PurchaseOrder.PurchaseOrderID)
        .then(() => {
        if (PurchaseOrder.Refund) {
            return new dbWalletManager_1.dbWalletManeger(PurchaseOrder.StreamerID, PurchaseOrder.TwitchUserID)
                .deposit(PurchaseOrder.SpentCoins);
        }
        res.status(200).send({ PurchaseOrderRemovedSuccessfully: new Date });
    })
        .catch((rej) => {
        console.log(rej);
        res.status(500).send(rej);
    });
});
app.get(Links_1.default.GetPurchaseOrder, async function (req, res) {
    new dbPurchaseOrderManager_1.default(req.params.StreamerID).getAllPurchaseOrders()
        .then((result) => {
        res.status(200).send(result);
    })
        .catch((rej) => {
        res.status(500).send(rej);
    });
});
app.get(Links_1.default.GetWallets, async function (req, res) {
    dbWalletManager_1.getAllWallets(req.params.StreamerID, req.params.TwitchUserID)
        .then((Wallets) => {
        res.status(200).send(Wallets);
    })
        .catch((rej) => {
        console.log(rej);
        res.status(500).send(rej);
    });
});
app.post(Links_1.default.WalletManager, async function (req, res) {
    let walletManagerRequest = req.body;
    new dbWalletManager_1.dbWalletManeger(walletManagerRequest.StreamerID, walletManagerRequest.TwitchUserID)
        .update(walletManagerRequest.newValue).then(() => {
        res.status(200).send({ WalletSuccessfullyChanged: new Date });
    })
        .catch((rej) => {
        console.log(rej);
        res.status(500).send(rej);
    });
});
exports.default = server;

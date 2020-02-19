import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import { PollRequest } from "./models/poll/PollRequest";
import { PollButton } from "./models/poll/PollButton";
import { PollStatus } from "./models/poll/PollStatus";
import { Poll } from "./models/poll/Poll";
import { AddBetRequest } from "./models/poll/AddBetRequest";
import { MinerManagerRequest } from "./models/miner/MinerManagerRequest";
import { MinerSettings } from "./models/miner/MinerSettings";
import { MinerRequest } from "./models/miner/MinerRequest";
import { PollController } from "./controller/PollController";
import { MiningResponse } from "./models/miner/MiningResponse";
import UpdateButtonGroupResult from "./models/poll/UpdateButtonGroupResult";
import { dbStreamerManager } from "./modules/database/dbStreamerManager";
import { dbWalletManeger } from "./modules/database/miner/dbWalletManager";
import links from "./Links";
import MinerManeger from "./modules/database/miner/dbMinerManager";
import StreamerSettings from "./modules/database/streamer_settings/StreamerSettings";
import { CoinsSettingsManagerRequest } from "./models/streamer_settings/CoinsSettingsManagerRequest";
import { CoinsSettings } from "./models/streamer_settings/CoinsSettings";
import dbStoreManager from "./modules/database/store/dbStoreManager";
import StoreItem from "./models/store/StoreItem";
import fs = require('fs');
import http = require('http')
import Socket_io = require('socket.io')
import UploadFileResponse from "./models/files_manager/UploadFileResponse";
import path = require('path');
import BuyStoreItemRequest from "./modules/database/store/BuyStoreItemRequest";
import PurchaseOrder from "./models/store/PurchaseOrder";
import dbPurchaseOrderManager from "./modules/database/store/dbPurchaseOrderManager";
import { dbPurchaseOrder } from "./models/store/dbPurchaseOrders";

const app = express();
const server = http.createServer(app);
const io = Socket_io(server).listen(server)

app.use(cors());
app.use(bodyParser.json());

function CheckRequisition(CheckList: (() => Object)[]) {
    let ErrorList = [];
    CheckList.forEach(chekage => {
        let fail = chekage();
        if (fail) ErrorList.push(fail)
    });
    return ErrorList
}
function ThereWinningButtonsInArray(PollButtons: PollButton[]): boolean {
    for (let i = 0; i < PollButtons.length; i++)
        if (PollButtons[i].IsWinner) return true;
    return false;
}

var Sockets:Socket_io.Socket[] = [];
function getSoketOfStreamer(StreamerID:string):Socket_io.Socket{
    return Sockets[StreamerID];
}

io.on('connect', (socket) => {
    socket.on('registered', (StreamerID)=>{
        Sockets[StreamerID] = socket;
    })
});

app.post(links.PollManager, async function (req: PollRequest, res: express.Response) {

    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "CurrentPollStatus is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    let pollController = new PollController(req.body.StreamerID);

    let PoolUpdateResult: { UpdatePollStatusRes: PollStatus, UpdateButtonGroupRes: UpdateButtonGroupResult };
    let DistribuitionResult: { DistributionStarted: Date; };

    let AccountData = dbStreamerManager.getAccountData(req.body.StreamerID);
    if (AccountData.CurrentPollStatus.PollWaxed)
        return res.status(200).send(pollController.CreatePoll());
    else {

        if (req.body.NewPollStatus) {
            AccountData.CurrentPollStatus = req.body.NewPollStatus;
            PoolUpdateResult = await pollController.UpdatePoll(req.body.PollButtons);

            if (AccountData.CurrentPollStatus.InDistribution &&
                !AccountData.CurrentPollStatus.PollWaxed &&
                !AccountData.CurrentPollStatus.DistributionStarted
            ) {
                if (ThereWinningButtonsInArray(req.body.PollButtons))
                    DistribuitionResult = await pollController.StartDistribuition(req.body.PollButtons);
                else
                    return res.status(500).send({ RequestError: 'There is no winning button' });
            }
        }
    }
    return res.status(200).send({ PoolUpdateResult, DistribuitionResult });

});

app.get(links.GetPoll, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let pollController = new PollController(req.params.StreamerID);

    pollController.getCurrentPoll()
        .then((resolve: Poll) => {
            res.status(200).send(resolve);
        })
        .catch((reje) => {
            res.status(500).send(reje)
        })
});

app.post(links.addVote, async function (req: AddBetRequest, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.body.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        },
        () => {
            let mensage: string;
            if (!req.body.Vote && req.body.Vote !== 0)
                mensage = "Vote is no defined";
            else if (!Number.isInteger(req.body.Vote))
                mensage = "Vote is no defined";

            if (mensage) return { RequestError: mensage };
        },
        () => {
            let mensage: string;

            if (!req.body.BetAmount && req.body.BetAmount !== 0)
                mensage = "BetAmount is no defined";
            else if (!Number.isInteger(req.body.BetAmount))
                mensage = "BetAmount not is Integer"
            else if (req.body.BetAmount < 1)
                mensage = "BetAmount not is Valid"

            if (mensage) return { RequestError: mensage };
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let pollController = new PollController(req.body.StreamerID);

    pollController.AddBet(
        req.body.TwitchUserID,
        req.body.Vote,
        req.body.BetAmount)
        .then((reso) => {
            res.status(200).send(reso);
        })
        .catch((reject) => {
            if (reject.RequestError) res.status(400).send(reject);
            else res.status(500).send(reject);
        })
});

app.post(links.MinerManager, async function (req: MinerManagerRequest, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.body.Setting)
                return ({ RequestError: "Setting is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    StreamerSettings.UpdateMinerSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso) })
        .catch((reje) => { res.status(500).send(reje) });
});

app.get(links.GetMinerSettings, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettings.getMinerSettings(req.params.StreamerID)
        .then((MinerSettings: MinerSettings) => {
            res.status(200).send(MinerSettings);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});

app.post(links.CoinsSettingsManager, async function (req: CoinsSettingsManagerRequest, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.body.Setting)
                return ({ RequestError: "Setting is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettings.UpdateCoinsSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso) })
        .catch((reje) => { res.status(500).send(reje) });
});

app.get(links.GetCoinsSettings, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettings.getCoinsSettings(req.params.StreamerID)
        .then((CoinsSettings: CoinsSettings) => {
            res.status(200).send(CoinsSettings);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});

app.post(links.MineCoin, async function (req: MinerRequest, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.body.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    MinerManeger.MineCoin(req.body.StreamerID, req.body.TwitchUserID)
        .then((resolve: MiningResponse) => { res.status(200).send(resolve) })
        .catch((reje) => {
            res.status(500).send(reje);
        });

});

app.get(links.GetWallet, async function (req: express.Request, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }, () => {
            if (!req.params.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbWalletManeger(req.params.StreamerID, req.params.TwitchUserID)
        .getWallet()
        .then((wallet) => {
            res.status(200).send(wallet);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});

app.post(links.StoreManager, async function (req, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbStoreManager(req.body.StreamerID).UpdateOrCreateStoreItem(req.body.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            res.status(500).send(reject);
        })
})

app.delete(links.StoreManager, async function (req, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbStoreManager(req.body.StreamerID).DeleteStoreItem(req.body.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            res.status(500).send(reject);
        })
})

app.get(links.GetStore, async function (req: { params: { StreamerID: string, StoreItemID: string } }, res: express.Response) {
    let dbStoreM = new dbStoreManager(req.params.StreamerID)

    if (req.params.StoreItemID === '-1') {
        dbStoreM.getAllItens()
            .then((result) => {
                res.status(200).send(<StoreItem[]>result);
            })
            .catch((rej) => {
                res.status(500).send(rej)
            })

    } else {
        dbStoreM.getIten(Number(req.params.StoreItemID))
            .then((result) => {
                res.status(200).send(<StoreItem>result);
            })
            .catch((rej) => {
                res.status(500).send(rej)
            })
    }

})

app.post(links.UploadFile, async function (req, res: express.Response) {
    let dir = `./uploads/${req.headers["streamer-id"]}`;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    let file = fs.createWriteStream(dir + '/' + req.headers["file-name"]);

    req.on('data', chunk => {
        file.write(chunk);
    })
    req.on('end', () => {
        file.end();
        res.status(200).send(new UploadFileResponse(<string>req.headers["file-name"], new Date));
    })
})

app.get(links.GetFile, async function (req, res: express.Response) {
    res.status(200).sendFile(path.resolve(`./uploads/${req.params.StreamerID}/${req.params.FileName}`))
})

app.post(links.BuyStoreItem, async function (req, res: express.Response) {
    let BuyRequest: BuyStoreItemRequest = req.body;
    //TODO add CheckRequisition
    let ItemPrice = (await new dbStoreManager(BuyRequest.StreamerID).getIten(BuyRequest.StoreItemID)).Price;
    let dbWalletM = new dbWalletManeger(BuyRequest.StreamerID, BuyRequest.TwitchUserID);

    if ((await dbWalletM.getWallet()).Coins < ItemPrice)
        return res.status(400).send({ ErrorBuying: 'Insufficient funds' })

    await dbWalletM.withdraw(ItemPrice);
    new dbPurchaseOrderManager(BuyRequest.StreamerID)
        .addPurchaseOrder(new PurchaseOrder(ItemPrice, BuyRequest.TwitchUserID, BuyRequest.StoreItemID, new Date))
        .then((result) => {
            getSoketOfStreamer(BuyRequest.StreamerID).emit('PurchasedItem', new Date)
            res.status(200).send({ PurchaseOrderWasSentSuccessfully: new Date })
        })
        .catch((rej) => {
            console.log(rej);
            res.status(500).send(rej);
        })
}
)

app.get(links.GetPurchaseOrder, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    new dbPurchaseOrderManager(req.params.StreamerID).getAllPurchaseOrders()
        .then((result) => {
            res.status(200).send(<dbPurchaseOrder[]>result);
        })
        .catch((rej) => {
            res.status(500).send(rej)
        })
})

export default server;
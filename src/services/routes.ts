import express = require("express");
import BodyParcer = require("body-parser");
import cors = require("cors");
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
import { WalletManeger } from "./modules/database/miner/dbWalletManager";
import links from "./Links";
import MinerManeger from "./modules/database/miner/dbMinerManager";
import StreamerSettings from "./modules/database/streamer_settings/StreamerSettings";
import { CoinsSettingsManagerRequest } from "./models/miner/CoinsSettingsManagerRequest";
import { CoinsSettings } from "./models/CoinsSettings";

const app = express();
app.use(cors());
app.use(BodyParcer.urlencoded({ extended: false }));
app.use(BodyParcer.json());

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

app.get(links.GetPoll, function (req: { params: { StreamerID: string } }, res: express.Response) {
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

app.post(links.addVote, function (req: AddBetRequest, res: express.Response) {
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

app.post(links.MinerManager, function (req: MinerManagerRequest, res: express.Response) {
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

app.get(links.GetMinerSettings, function (req: { params: { StreamerID: string } }, res: express.Response) {
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

app.post(links.CoinsSettingsManager, function (req: CoinsSettingsManagerRequest, res: express.Response) {
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

app.get(links.GetCoinsSettings, function (req: { params: { StreamerID: string } }, res: express.Response) {
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

app.post(links.MineCoin, function (req: MinerRequest, res: express.Response) {
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

app.get(links.GetWallet, function (req: express.Request, res: express.Response) {
    new WalletManeger(req.params.StreamerID, req.params.TwitchUserID)
        .getWallet().then((wallet) => {
            res.status(200).send(wallet);
        })
});

export { app };
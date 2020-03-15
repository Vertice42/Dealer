import express = require("express");
import { APP, CheckRequisition } from "..";
import { PollRequest } from "../models/poll/PollRequest";
import { PollStatus } from "../models/poll/PollStatus";
import UpdateButtonGroupResult from "../models/poll/UpdateButtonGroupResult";
import { dbManager } from "../modules/database/dbManager";
import { Poll } from "../models/poll/Poll";
import { AddBetRequest } from "../models/poll/AddBetRequest";
import { PollController } from "../controller/PollController";
import { PollButton } from "../models/poll/PollButton";
import { PollManagerRoute, AddBeatRoute, GetPollRoute } from "./routes";

function ThereWinningButtonsInArray(PollButtons: PollButton[]): boolean {
    for (let i = 0; i < PollButtons.length; i++)
        if (PollButtons[i].IsWinner) return true;
    return false;
}

APP.post(PollManagerRoute, async function (req: PollRequest, res: express.Response) {

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

    let AccountData = dbManager.getAccountData(req.body.StreamerID);
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
APP.get(GetPollRoute, async function (req: { params: { StreamerID: string } }, res: express.Response) {
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
            console.error(reje);
            
            res.status(500).send(reje)
        })
});
APP.post(AddBeatRoute, async function (req: AddBetRequest, res: express.Response) {
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
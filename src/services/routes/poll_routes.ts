import express = require("express");

import IOListeners from "../models/listeners/IOListeners";
import PollController from "../controller/PollController";

import { APP } from "..";
import { PollRequest } from "../models/poll/PollRequest";
import { AddBetRequest } from "../models/poll/AddBetRequest";
import { PollButton } from "../models/poll/PollButton";
import { PollManagerRoute, AddBetRoute, GetPollRoute } from "./routes";
import { getSocketOfStreamer } from "../modules/SocketsManager";
import { Authenticate } from "../modules/Authentication";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import dbManager from "../modules/databaseManager/dbManager";
import { Poll } from "../models/poll/Poll";
import CheckRequisition from "../utils/CheckRequisition";

function ThereWinningButtonsInArray(PollButtons: PollButton[]): boolean {
    for (let i = 0; i < PollButtons.length; i++)
        if (PollButtons[i].IsWinner) return true;
    return false;
}

APP.post(PollManagerRoute, async function (req, res: express.Response) {
    let PollRequest: PollRequest = req.body;

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(PollRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    let ErrorList = CheckRequisition([
        () => {
            if (!PollRequest.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!PollRequest.NewPollStatus)
                return ({ RequestError: "CurrentPollStatus is no defined" })
        },
        () => {
            if (!dbManager.getAccountData(StreamerID))
                return ({ RequestError: "The streamer did not start the extension" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    try {
        let PollControl = new PollController(StreamerID);

        let PoolUpdateResult;
        let StartDistributionResult;

        let CurrentPollStatus = await PollControl.getCurrentPollStatus();
        if (CurrentPollStatus.PollWaxed) {
            PollControl.stopDistributions();
            let CreateResult = await PollControl.CreatePoll(PollRequest.NewPollStatus)
            return res.status(200).send(CreateResult);
        } else {
            PoolUpdateResult = await PollControl.UpdatePoll(PollRequest.NewPollStatus, PollRequest.PollButtons);
            CurrentPollStatus = await PollControl.getCurrentPollStatus();

            if (CurrentPollStatus.DistributionStarted &&
                !CurrentPollStatus.DistributionCompleted &&
                !CurrentPollStatus.InDistribution &&
                PollRequest.PollButtons) {
                CurrentPollStatus.InDistribution = true;
                await PollControl.UpdatePollStatus(CurrentPollStatus);
                if (ThereWinningButtonsInArray(PollRequest.PollButtons)) {
                    PollControl.OnDistributionsEnd = async (StatisticsOfDistribution) => {
                        CurrentPollStatus.DistributionCompleted = true;
                        CurrentPollStatus.DistributionStatisticsJson = JSON.stringify(StatisticsOfDistribution);
                        await PollControl.UpdatePollStatus(CurrentPollStatus);
                        let SocketsOfStreamer = getSocketOfStreamer(StreamerID);
                        if (SocketsOfStreamer) {
                            SocketsOfStreamer.forEach(socket => {
                                socket.emit(IOListeners.onDistributionFinish);
                            });
                        }
                    }
                    StartDistributionResult = await PollControl.startDistributions(PollRequest.PollButtons);
                } else {
                    return res.status(400).send({ RequestError: 'There is no winning button' });
                }
            }
        }
        res.status(200).send({ PoolUpdateResult, StartDistributionResult });
    } catch (error) {
        console.error('Error in PollManager', error);
        res.status(500).send(error);
    }

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
        .catch((rej) => {
            if (rej.code) {
                res.status(rej.code).send(rej.message);
            } else {
                console.error('Error in getCurrentPoll', rej);
                res.status(500).send(rej)
            }
        })
});
APP.post(AddBetRoute, async function (req, res: express.Response) {
    let AddBetRequest = <AddBetRequest>req.body;

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(AddBetRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    let ErrorList = CheckRequisition([
        () => {
            if (!AddBetRequest.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            let message: string;
            if (!AddBetRequest.Vote && AddBetRequest.Vote !== 0)
                message = "Vote is no defined";
            else if (!Number.isInteger(AddBetRequest.Vote))
                message = "Vote is no defined";

            if (message) return { RequestError: message };
        },
        () => {
            let message: string;

            if (!AddBetRequest.BetAmount && AddBetRequest.BetAmount !== 0)
                message = "BetAmount is no defined";
            else if (!Number.isInteger(AddBetRequest.BetAmount))
                message = "BetAmount not is Integer"
            else if (AddBetRequest.BetAmount < 1)
                message = "BetAmount not is Valid"

            if (message) return { RequestError: message };
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let pollController = new PollController(StreamerID);

    pollController.AddBet(
        AddBetRequest.TwitchUserName,
        AddBetRequest.Vote,
        AddBetRequest.BetAmount)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            if (reject.RequestError) {
                res.status(400).send(reject);
            } else {
                console.error('Error in AddBet', reject);
                res.status(500).send(reject);
            }
        })
});
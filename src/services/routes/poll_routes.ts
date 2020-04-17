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
import { PollManagerRoute, AddBetRoute, GetPollRoute } from "./routes";
import { getSocketOfStreamer } from "../SocketsManager";
import IOListeners from "../IOListeners";
import { Authenticate } from "../modules/Authentication";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";

function ThereWinningButtonsInArray(PollButtons: PollButton[]): boolean {
    for (let i = 0; i < PollButtons.length; i++)
        if (PollButtons[i].IsWinner) return true;
    return false;
}

APP.post(PollManagerRoute, async function (req, res: express.Response) {
    let PollRequest: PollRequest = req.body;

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult> await Authenticate(PollRequest.Token)}
    catch (error) {return res.status(401).send(error)}

    let StreamerID = Result.channel_id;

    let ErrorList = CheckRequisition([
        () => {
            if (!PollRequest.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!PollRequest.NewPollStatus)
                return ({ RequestError: "CurrentPollStatus is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    let pollController = new PollController(StreamerID);

    let PoolUpdateResult: { UpdatePollStatusRes: PollStatus, UpdateButtonGroupRes: UpdateButtonGroupResult };
    let StartDistributionResult: { DistributionStarted: Date; };

    let AccountData = dbManager.getAccountData(StreamerID);
    if (AccountData.CurrentPollStatus.PollWaxed) {
        return res.status(200).send(pollController.CreatePoll());
    } else {

        if (PollRequest.NewPollStatus) {
            AccountData.CurrentPollStatus = PollRequest.NewPollStatus;
            PoolUpdateResult = await pollController.UpdatePoll(PollRequest.PollButtons);            

            if (AccountData.CurrentPollStatus.InDistribution &&
                !AccountData.CurrentPollStatus.DistributionStarted) {
                if (AccountData.CurrentPollStatus.PollWaxed) {
                    pollController.stopDistributions();
                } else if (ThereWinningButtonsInArray(PollRequest.PollButtons)) {                    
                    pollController.OnDistributionsEnd = (StatisticsOfDistribution) => {                        
                        AccountData.CurrentPollStatus.DistributionCompleted = true
                        AccountData.CurrentPollStatus.StatisticsOfDistribution = StatisticsOfDistribution;

                        let SocketsOfStreamer = getSocketOfStreamer(StreamerID);

                        if (SocketsOfStreamer) {
                            SocketsOfStreamer.forEach(socket => {
                                socket.emit(IOListeners.onDistributionFinish);
                            });
                        }
                    }
                    try {                        
                        StartDistributionResult = await pollController.startDistributions(PollRequest.PollButtons);
                    } catch (error) {
                        return res.status(500).send(error);
                    }
                } else {
                    return res.status(500).send({ RequestError: 'There is no winning button' });
                }
            }
        }
    }
    return res.status(200).send({ PoolUpdateResult, DistributionsResult: StartDistributionResult });

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
            console.error(rej);

            res.status(500).send(rej)
        })
});
APP.post(AddBetRoute, async function (req, res: express.Response) {
    let AddBetRequest = <AddBetRequest>req.body;          

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult> await Authenticate(AddBetRequest.Token)}
    catch (error) {return res.status(401).send(error)}

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
            if (reject.RequestError) res.status(400).send(reject);
            else res.status(500).send(reject);
        })
});
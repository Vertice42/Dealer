import express = require("express");
import { APP, CheckRequisition } from "..";
import MinerManager from "../modules/database/miner/dbMinerManager";
import { MiningResponse } from "../models/miner/MiningResponse";
import { MinerRequest } from "../models/miner/MinerRequest";
import { MineCoinRoute } from "./routes";

APP.post(MineCoinRoute, async function (req, res: express.Response) {
    let MinerRequest = <MinerRequest>req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!MinerRequest.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!MinerRequest.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    MinerManager.MineCoin(MinerRequest.StreamerID, MinerRequest.TwitchUserID)
        .then((resolve: MiningResponse) => { res.status(200).send(resolve) })
        .catch((rej) => { res.status(500).send(rej) });
});
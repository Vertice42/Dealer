import express = require("express");
import { APP, CheckRequisition } from "..";
import MinerManeger from "../modules/database/miner/dbMinerManager";
import { MiningResponse } from "../models/miner/MiningResponse";
import { MinerRequest } from "../models/miner/MinerRequest";
import { MineCoinRoute } from "./routes";
 
APP.post(MineCoinRoute, async function (req: MinerRequest, res: express.Response) {
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
    //TODO ADICINADO MINIRAÇÃO MACIMA
});
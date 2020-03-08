import express = require("express");
import { APP, CheckRequisition } from "..";
import { MinerManagerRequest } from "../models/miner/MinerManagerRequest";
import { MinerSettings } from "../models/miner/MinerSettings";
import MinerManeger from "../modules/database/miner/dbMinerManager";
import { MiningResponse } from "../models/miner/MiningResponse";
import { MinerRequest } from "../models/miner/MinerRequest";
import { MinerManagerRoute, MineCoinRoute, GetMinerSettingsRoute } from "./routes";
import StreamerSettingsManager from "../modules/database/streamer_settings/StreamerSettingsManager";
 
APP.post(MinerManagerRoute, async function (req: MinerManagerRequest, res: express.Response) {
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

    StreamerSettingsManager.UpdateMinerSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso) })
        .catch((reje) => { res.status(500).send(reje) });
});
APP.get(GetMinerSettingsRoute, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettingsManager.getMinerSettings(req.params.StreamerID)
        .then((MinerSettings: MinerSettings) => {
            res.status(200).send(MinerSettings);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});
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
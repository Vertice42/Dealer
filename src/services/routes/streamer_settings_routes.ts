import express = require("express");
import { APP, CheckRequisition } from "..";
import { CoinsSettingsManagerRequest } from "../models/streamer_settings/CoinsSettingsManagerRequest";
import { CoinsSettings } from "../models/streamer_settings/CoinsSettings";
import { CoinsSettingsManagerRoute, GetCoinsSettingsRoute } from "./routes";
import StreamerSettingsManager from "../modules/database/streamer_settings/StreamerSettingsManager";

APP.post(CoinsSettingsManagerRoute, async function (req: CoinsSettingsManagerRequest, res: express.Response) {
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
    StreamerSettingsManager.UpdateCoinsSettings(req.body.StreamerID, req.body.Setting)
        .then((reso) => { res.status(200).send(reso) })
        .catch((reje) => { res.status(500).send(reje) });
});
APP.get(GetCoinsSettingsRoute, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    StreamerSettingsManager.getCoinsSettings(req.params.StreamerID)
        .then((CoinsSettings: CoinsSettings) => {
            res.status(200).send(CoinsSettings);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});
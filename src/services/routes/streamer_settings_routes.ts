import express = require("express");
import { APP } from "..";
import { CoinsSettingsManagerRequest } from "../models/streamer_settings/CoinsSettingsManagerRequest";
import { CoinsSettings } from "../models/streamer_settings/CoinsSettings";
import { CoinsSettingsManagerRoute, GetCoinsSettingsRoute, MinerManagerRoute, GetMinerSettingsRoute } from "./routes";
import { MinerManagerRequest } from "../models/miner/MinerManagerRequest";
import { MinerSettings } from "../models/streamer_settings/MinerSettings";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";
import StreamerSettingsManager from "../modules/databaseManager/streamer_settings/StreamerSettingsManager";
import CheckRequisition from "../utils/CheckRequisition";
import { CheckWord } from "../utils/functions";

const BlackListOfCoinsName = ['bit', 'twitch'];

APP.post(CoinsSettingsManagerRoute, async function (req, res: express.Response) {
    let CoinsSettingsManagerRequest: CoinsSettingsManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!CoinsSettingsManagerRequest.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!CoinsSettingsManagerRequest.Setting)
                return ({ RequestError: "Setting is no defined" })
        }
        ,
        () => {
            if (CheckWord(CoinsSettingsManagerRequest.Setting.CoinName, BlackListOfCoinsName)) 
            { return ({ RequestError: `CoinName "${CoinsSettingsManagerRequest.Setting.CoinName}" is prohibited`}) }
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(CoinsSettingsManagerRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    StreamerSettingsManager.UpdateOrCreateCoinsSettings(StreamerID, CoinsSettingsManagerRequest.Setting)
        .then((resolve) => { res.status(200).send(resolve) })
        .catch((reject) => {
            console.error('Error in UpdateOrCreateCoinsSettings', reject);
            res.status(500).send(reject);
        });
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
            console.error('Error in getCoinsSettings', rej);
            res.status(500).send(rej);
        })
});

APP.post(MinerManagerRoute, async function (req, res: express.Response) {
    let MinerManagerRequest: MinerManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!MinerManagerRequest.Token)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!MinerManagerRequest.Setting)
                return ({ RequestError: "Setting is no defined" })
        },
        () => {
            if (!((MinerManagerRequest.Setting.RewardPerMinute < 1.1 &&
                (MinerManagerRequest.Setting.RewardPerMinute > 0))))
                return ({ RequestError: "RewardPerMinute invalid" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(MinerManagerRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    StreamerSettingsManager.UpdateMinerSettings(StreamerID, MinerManagerRequest.Setting)
        .then((resolve) => { res.status(200).send(resolve) })
        .catch((reject) => {
            console.error('Error in UpdateMinerSettings', reject);
            res.status(500).send(reject)
        });
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
            console.error('Error in getMinerSettings', rej);
            res.status(500).send(rej);
        })
});
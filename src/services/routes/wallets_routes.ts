import express = require("express");

import { APP } from "..";
import { dbWallet } from "../models/poll/dbWallet";
import { WalletManagerRequest } from "../models/wallet/WalletManagerRequest";
import { GetWalletRoute, WalletManager, GetWalletsRoute } from "./routes";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";
import { dbWalletManager, getAllWallets } from "../modules/databaseManager/wallet/dbWalletManager";
import CheckRequisition from "../utils/CheckRequisition";

APP.get(GetWalletRoute, async function (req, res: express.Response) {
    var Request = <{ StreamerID: string, TwitchUserID: string }>req.params;
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

    new dbWalletManager(Request.StreamerID, Request.TwitchUserID)
        .getWallet()
        .then((wallet) => {
            res.status(200).send(wallet);
        })
        .catch((rej) => {
            if (rej.RequestError) {
                res.status(400).send(rej);
            } else {
                console.error('Error in getWallet', rej);
                res.status(500).send(rej);
            }

        })
});

APP.get(GetWalletsRoute, async function (req: express.Request, res: express.Response) {
    var Request = <{ StreamerID: string, TwitchUserID: string }>req.params;
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

    getAllWallets(Request.StreamerID, Request.TwitchUserID)
        .then((Wallets) => {
            res.status(200).send(<dbWallet[]>Wallets);
        })
        .catch((rej) => {
            if (rej.RequestError) {
                res.status(400).send(rej);
            } else {
                console.error('Error in getAllWallets', rej);
                res.status(500).send(rej);
            }

        })
});

APP.post(WalletManager, async function (req, res: express.Response) {
    let walletManagerRequest: WalletManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!walletManagerRequest.Token)
                return ({ RequestError: "Token is no defined" })
        }, () => {
            if (!walletManagerRequest.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        }, () => {
            if (!(walletManagerRequest.newValue <= 10000000))
                return ({ RequestError: "TwitchUserID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });


    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(walletManagerRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    new dbWalletManager(StreamerID, walletManagerRequest.TwitchUserID)
        .update(walletManagerRequest.newValue)
        .then(() => {
            res.status(200).send({ WalletSuccessfullyChanged: new Date });
        })
        .catch((rej) => {
            console.error('Error in update dbWalletManager', rej);
            res.status(500).send(rej);
        })
})
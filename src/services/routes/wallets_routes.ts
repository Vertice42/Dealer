import express = require("express");

import { APP, CheckRequisition } from "..";
import { dbWallet } from "../models/poll/dbWallet";
import { WalletManagerRequest } from "../models/wallet/WalletManagerRequest";
import { GetWalletRoute, WalletManager, GetWalletsRoute } from "./routes";
import { getAllWallets, dbWalletManeger } from "../modules/database/wallet/dbWalletManager";

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

    new dbWalletManeger(Request.StreamerID, Request.TwitchUserID)
        .getWallet()
        .then((wallet) => {
            res.status(200).send(wallet);
        })
        .catch((rej) => {
            res.status(500).send(rej);
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
            console.error(rej);
            res.status(500).send(rej);
        })
});

APP.post(WalletManager, async function (req, res: express.Response) {
    let walletManagerRequest: WalletManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!walletManagerRequest.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }, () => {
            if (!walletManagerRequest.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        }, () => {
            if (!(walletManagerRequest.newValue <= 10000000))
                return ({ RequestError: "TwitchUserID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbWalletManeger(walletManagerRequest.StreamerID, walletManagerRequest.TwitchUserID)
        .update(walletManagerRequest.newValue)
        .then(() => {
            res.status(200).send({ WalletSuccessfullyChanged: new Date });
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})
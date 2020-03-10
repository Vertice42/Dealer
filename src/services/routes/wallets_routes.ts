import express = require("express");

import { APP, CheckRequisition } from "..";
import { getAllWallets, dbWalletManeger } from "../modules/database/miner/dbWalletManager";
import { dbWallet } from "../models/poll/dbWallet";
import { WalletManagerRequest } from "../models/wallet/WalletManagerRequest";
import { GetWalletRoute, WalletManager } from "./routes";

APP.get(GetWalletRoute, async function (req: express.Request, res: express.Response) {
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

    if (Request.TwitchUserID === '*') {
        getAllWallets(Request.StreamerID, Request.TwitchUserID)
            .then((Wallets) => {
                res.status(200).send(<dbWallet[]>Wallets);
            })
            .catch((rej) => {
                console.error(rej);
                res.status(500).send(rej);
            })
    } else {
        new dbWalletManeger(Request.StreamerID, Request.TwitchUserID)
            .getWallet()
            .then((wallet) => {
                res.status(200).send(wallet);
            })
            .catch((rej) => {                
                res.status(500).send(rej);
            })
    }
});
APP.post(WalletManager, async function (req, res: express.Response) {
    let walletManagerRequest: WalletManagerRequest = req.body;
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
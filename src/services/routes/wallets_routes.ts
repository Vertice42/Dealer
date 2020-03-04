import express = require("express");

import { APP, CheckRequisition } from "..";
import Links from "../Links";
import { getAllWallets, dbWalletManeger } from "../modules/database/miner/dbWalletManager";
import { dbWallet } from "../models/poll/dbWallet";
import { WalletManagerRequest } from "../models/wallet/WalletManagerRequest";

APP.get(Links.GetWallets, async function (req: { params: { StreamerID: string, TwitchUserID: string } }, res: express.Response) {
    getAllWallets(req.params.StreamerID, req.params.TwitchUserID)
        .then((Wallets) => {
            res.status(200).send(<dbWallet[]>Wallets);
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})

APP.get(Links.GetWallet, async function (req: express.Request, res: express.Response) {
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

    new dbWalletManeger(req.params.StreamerID, req.params.TwitchUserID)
        .getWallet()
        .then((wallet) => {
            res.status(200).send(wallet);
        })
        .catch((rej) => {
            res.status(500).send(rej);
        })
});

APP.post(Links.WalletManager, async function (req, res: express.Response) {
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

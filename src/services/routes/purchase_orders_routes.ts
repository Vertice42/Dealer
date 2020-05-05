import express = require("express");

import PurchaseOrder from "../models/store/PurchaseOrder";
import IO_Listeners from "../models/listeners/IOListeners";
import { dbPurchaseOrder } from "../models/store/dbPurchaseOrders";
import PurchaseOrderRequest from "../models/store/PurchaseOrderRequest";
import { PurchaseOrderRoute, GetPurchaseOrderRoute } from "./routes";
import DeletePurchaseOrderRequest from "../models/store/DeletePurchaseOrderRequest";
import { APP } from "..";
import { getSocketOfStreamer } from "../modules/SocketsManager";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";
import { getItemsSetting } from "../models/store/StoreItem";
import { dbWalletManager } from "../modules/databaseManager/wallet/dbWalletManager";
import dbStoreManager from "../modules/databaseManager/store/dbStoreManager";
import dbPurchaseOrderManager from "../modules/databaseManager/store/dbPurchaseOrderManager";
import CheckRequisition from "../utils/CheckRequisition";

APP.post(PurchaseOrderRoute, async function (req, res: express.Response) {
    let PurchaseOrderRequest: PurchaseOrderRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!PurchaseOrderRequest.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!PurchaseOrderRequest.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        },
        () => {
            if (!PurchaseOrderRequest.StoreItemID)
                return ({ RequestError: "StoreItemID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(PurchaseOrderRequest.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    let ItemPrice = (await new dbStoreManager(StreamerID).getItem(PurchaseOrderRequest.StoreItemID)).Price;
    let dbWalletM = new dbWalletManager(StreamerID, PurchaseOrderRequest.TwitchUserID);

    if ((await dbWalletM.getWallet()).Coins < ItemPrice) {
        return res.status(400).send({ ErrorBuying: 'Insufficient funds' })
    }

    let dbStoreItem = await new dbStoreManager(StreamerID).getItem(PurchaseOrderRequest.StoreItemID);
    let dbPurchaseOrderMan = new dbPurchaseOrderManager(StreamerID);
    let SingleReproduction = getItemsSetting('SingleReproduction',dbStoreItem.ItemsSettings);

    if (SingleReproduction.Enable) {
        if (await dbPurchaseOrderMan.getPurchaseOrderByStoreItemID(PurchaseOrderRequest.StoreItemID)) {
            return res.status(423).send({ PurchaseFailed: 'There can be only one item at a time in the order fight' })
        }
    }

    dbPurchaseOrderMan.addPurchaseOrder(new PurchaseOrder(ItemPrice, PurchaseOrderRequest.TwitchUserID, PurchaseOrderRequest.StoreItemID)
    )
        .then(async (dbPurchaseOrder) => {
            await dbWalletM.withdraw(ItemPrice);
            getSocketOfStreamer(StreamerID).forEach(socket => {
                socket.emit(IO_Listeners.onAddPurchasedItem, <PurchaseOrder>dbPurchaseOrder);
            })
            res.status(200).send({ PurchaseOrderWasSentSuccessfully: new Date })
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})
APP.delete(PurchaseOrderRoute, async function (req, res: express.Response) {
    let PurchaseOrder: DeletePurchaseOrderRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!PurchaseOrder.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!PurchaseOrder.TwitchUserID)
                return ({ RequestError: "TwitchUserID is no defined" })
        },
        () => {
            if (!PurchaseOrder.StoreItemID)
                return ({ RequestError: "StoreItemID is no defined" })
        },
        () => {
            if (!PurchaseOrder.SpentCoins)
                return ({ RequestError: "SpentCoins is no defined" })
        },
        () => {
            if (!(typeof PurchaseOrder.PurchaseOrderID))
                return ({ RequestError: "PurchaseOrderID is no defined" })
        }
    ])

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(PurchaseOrder.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });
    new dbPurchaseOrderManager(StreamerID)
        .removePurchaseOrder(PurchaseOrder.PurchaseOrderID)
        .then(async () => {
            if (PurchaseOrder.Refund) {
                await new dbWalletManager(StreamerID, PurchaseOrder.TwitchUserID)
                    .deposit(PurchaseOrder.SpentCoins)
            }
            return res.status(200).send({ PurchaseOrderRemovedSuccessfully: new Date })
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})
APP.get(GetPurchaseOrderRoute, async function (req: { params: { StreamerID: string, StoreItemID: string } }, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!req.params.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.params.StoreItemID)
                return ({ RequestError: "StoreItemID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    new dbPurchaseOrderManager(req.params.StreamerID).getAllPurchaseOrders(req.params.StoreItemID)
        .then((result) => {
            res.status(200).send(<dbPurchaseOrder[]>result);
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})
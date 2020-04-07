import express = require("express");

import dbPurchaseOrderManager from "../modules/database/store/dbPurchaseOrderManager";
import PurchaseOrder from "../models/store/PurchaseOrder";
import IO_Listeners from "../IOListeners";
import { dbPurchaseOrder } from "../models/store/dbPurchaseOrders";
import PurchaseOrderRequest from "../models/store/PurchaseOrderRequest";
import dbStoreManager from "../modules/database/store/dbStoreManager";
import ItemSetting from "../models/store/item_settings/ItemSettings";
import { PurchaseOrderRoute, GetPurchaseOrderRoute } from "./routes";
import DeletePurchaseOrderRequest from "../models/store/DeletePurchaseOrderRequest";
import { APP, CheckRequisition } from "..";
import { getSoketOfStreamer } from "../SocketsManager";
import { dbWalletManeger } from "../modules/database/wallet/dbWalletManager";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";

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

    let ItemPrice = (await new dbStoreManager(StreamerID).getIten(PurchaseOrderRequest.StoreItemID)).Price;
    let dbWalletM = new dbWalletManeger(StreamerID, PurchaseOrderRequest.TwitchUserID);

    if ((await dbWalletM.getWallet()).Coins < ItemPrice) {
        return res.status(400).send({ ErrorBuying: 'Insufficient funds' })
    }

    let dbStoreIten = await new dbStoreManager(StreamerID).getIten(PurchaseOrderRequest.StoreItemID);
    let ItemSettings: ItemSetting[] = JSON.parse(dbStoreIten.ItemSettingsJson);

    let SingleReproductionEnable = false;
    ItemSettings.forEach(ItemSetting => {
        if (ItemSetting.DonorFeatureName === 'SingleReproduction' && ItemSetting.Enable
        )
            SingleReproductionEnable = true;
    });
    let dbPurchaseOrderMan = new dbPurchaseOrderManager(StreamerID);

    if (SingleReproductionEnable) {
        if (await dbPurchaseOrderMan.getPurchaseOrderByStoreItemID(PurchaseOrderRequest.StoreItemID)) {
            return res.status(423).send({ PurchaseFailed: 'There can be only one item at a time in the order fight' })
        }
    }

    dbPurchaseOrderMan.addPurchaseOrder(new PurchaseOrder(ItemPrice, PurchaseOrderRequest.TwitchUserID, PurchaseOrderRequest.StoreItemID)
    )
        .then(async (dbPurchaseOrder) => {
            await dbWalletM.withdraw(ItemPrice);
            getSoketOfStreamer(StreamerID).forEach(socket => {
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
                await new dbWalletManeger(StreamerID, PurchaseOrder.TwitchUserID)
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
            res.status(500).send(rej)
        })
})
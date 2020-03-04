import express = require("express");

import { APP, getSoketOfStreamer } from "..";
import { dbWalletManeger } from "../modules/database/miner/dbWalletManager";
import dbPurchaseOrderManager from "../modules/database/store/dbPurchaseOrderManager";
import PurchaseOrder from "../models/store/PurchaseOrder";
import IO_Listeners from "../IO_Listeners";
import DeletePurchaseOrderRequest from "../modules/database/store/DeletePurchaseOrderRequest";
import { dbPurchaseOrder } from "../models/store/dbPurchaseOrders";
import Links from "../Links";
import PurchaseOrderRequest from "../modules/database/store/PurchaseOrderRequest";
import dbStoreManager from "../modules/database/store/dbStoreManager";
import ItemSettings from "../models/store/ItemSettings";

APP.post(Links.PurchaseOrder, async function (req, res: express.Response) {
    let PurchaseOrderRequest: PurchaseOrderRequest = req.body;
    //TODO add CheckRequisition

    let ItemPrice = (await new dbStoreManager(PurchaseOrderRequest.StreamerID).getIten(PurchaseOrderRequest.StoreItemID)).Price;
    let dbWalletM = new dbWalletManeger(PurchaseOrderRequest.StreamerID, PurchaseOrderRequest.TwitchUserID);

    if ((await dbWalletM.getWallet()).Coins < ItemPrice) {
        return res.status(400).send({ ErrorBuying: 'Insufficient funds' })
    }

    let dbStoreIten = await new dbStoreManager(PurchaseOrderRequest.StreamerID).getIten(PurchaseOrderRequest.StoreItemID);
    let ItemSettings: ItemSettings[] = JSON.parse(dbStoreIten.ItemSettingsJson);

    let SingleReproductionEnable = false;
    ItemSettings.forEach(ItemSetting => {
        if (ItemSetting.DonorFeatureName === 'SingleReproduction' && ItemSetting.Enable
        )
            SingleReproductionEnable = true;
    });
    let dbPurchaseOrderMan = new dbPurchaseOrderManager(PurchaseOrderRequest.StreamerID);

    if (SingleReproductionEnable) {
        if (await dbPurchaseOrderMan.getdbPurchaseOrderByStoreItemID(PurchaseOrderRequest.StoreItemID)){
            return res.status(423).send({PurchaseFailed:'There can be only one item at a time in the order fight'})
        }
    }

    dbPurchaseOrderMan.addPurchaseOrder(new PurchaseOrder(ItemPrice, PurchaseOrderRequest.TwitchUserID, PurchaseOrderRequest.StoreItemID)
    )
        .then(async (dbPurchaseOrder) => {
            await dbWalletM.withdraw(ItemPrice);
            getSoketOfStreamer(PurchaseOrderRequest.StreamerID).emit(IO_Listeners.onAddPurchasedItem, <PurchaseOrder>dbPurchaseOrder)
            res.status(200).send({ PurchaseOrderWasSentSuccessfully: new Date })
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})

APP.delete(Links.PurchaseOrder, async function (req, res: express.Response) {
    let PurchaseOrder: DeletePurchaseOrderRequest = req.body;
    new dbPurchaseOrderManager(PurchaseOrder.StreamerID)
        .removePurchaseOrder(PurchaseOrder.PurchaseOrderID)
        .then(async () => {
            if (PurchaseOrder.Refund) {
                await new dbWalletManeger(PurchaseOrder.StreamerID, PurchaseOrder.TwitchUserID)
                    .deposit(PurchaseOrder.SpentCoins)
            }
            return res.status(200).send({ PurchaseOrderRemovedSuccessfully: new Date })
        })
        .catch((rej) => {
            console.error(rej);
            res.status(500).send(rej);
        })
})

APP.get(Links.GetPurchaseOrder, async function (req: { params: { StreamerID: string } }, res: express.Response) {
    new dbPurchaseOrderManager(req.params.StreamerID).getAllPurchaseOrders()
        .then((result) => {
            res.status(200).send(<dbPurchaseOrder[]>result);
        })
        .catch((rej) => {
            res.status(500).send(rej)
        })
})
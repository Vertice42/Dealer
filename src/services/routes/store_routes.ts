import express = require("express");
import { APP, CheckRequisition } from "..";
import dbStoreManager from "../modules/database/store/dbStoreManager";
import StoreManagerRequest from "../models/store/StoreManagerRequest";
import ControllerOfPermissions from "../controller/ControllerOfPermissions";
import StoreItem from "../models/store/StoreItem";
import Links from "../Links";

APP.post(Links.StoreManager, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;

    let ErrorList = CheckRequisition([
        () => {
            if (!Request.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!Request.StoreItem) {
                return ({ RequestError: "StoreItem is no defined" })
                //TODO ADD CHEKES
            }
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
    //TODO ADICIONAR dotenv

    if (!(await new ControllerOfPermissions(Request.StreamerID).AllItemsSettingsIsUnlocked(Request.StoreItem.ItemsSettings))) {
        return res.status(423).send({ mensage: 'This feature is blocked for you' })
    }

    new dbStoreManager(Request.StreamerID).UpdateOrCreateStoreItem(Request.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            console.error(reject);

            res.status(500).send(reject);
        })
})

APP.delete(Links.StoreManager, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbStoreManager(Request.StreamerID).DeleteStoreItem(req.body.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            res.status(500).send(reject);
        })
})

APP.get(Links.GetStore, async function (req: { params: { StreamerID: string, StoreItemID: string } }, res: express.Response) {
    let dbStoreM = new dbStoreManager(req.params.StreamerID)

    if (req.params.StoreItemID === '-1') {
        dbStoreM.getAllItens()
            .then((dbStoreItems) => {
                let StoreItems: StoreItem[] = [];

                dbStoreItems.forEach((dbStoreItem, index) => {
                    StoreItems[index] =
                        new StoreItem(
                            dbStoreItem.id,
                            dbStoreItem.Type,
                            dbStoreItem.Description,
                            JSON.parse(dbStoreItem.ItemSettingsJson),
                            dbStoreItem.FileName,
                            dbStoreItem.Price)
                });
                res.status(200).send(StoreItems);
            })
            .catch((rej) => {
                res.status(500).send(rej)
            })

    } else {
        dbStoreM.getIten(Number(req.params.StoreItemID))
            .then((Item) => {
                res.status(200).send(<StoreItem>Item);
            })
            .catch((rej) => {
                res.status(500).send(rej)
            })
    }

})
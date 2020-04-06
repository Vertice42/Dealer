import express = require("express");
import { APP, CheckRequisition } from "..";
import dbStoreManager from "../modules/database/store/dbStoreManager";
import StoreManagerRequest from "../models/store/StoreManagerRequest";
import ControllerOfPermissions from "../controller/ControllerOfPermissions";
import StoreItem from "../models/store/StoreItem";
import { StoreManagerRoute, GetStoreRoute } from "./routes";
import del = require("del");
import FolderTypes from "../models/files_manager/FolderTypes";
import { isEquivalent } from "../../utils/funtions";

APP.post(StoreManagerRoute, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;

    let ErrorList = CheckRequisition([
        () => {
            if (!Request.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!Request.StoreItem) {
                return ({ RequestError: "StoreItem is no defined" })
            }
        },
        () => {
            if (!Request.StoreItem ) {
                return ({ RequestError: "StoreItem is no defined" })
            }
        },
        () => {
            if (!Request.StoreItem.id ) {
                return ({ RequestError: "StoreItem ID is no defined" })
            }
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    if ((await new ControllerOfPermissions(Request.StreamerID).AllSettingsISLocked(Request.StoreItem.ItemsSettings))) {
        return res.status(423).send({ mensage: 'This feature is blocked for you' })
    }

    new dbStoreManager(Request.StreamerID).UpdateOrCreateStoreItem(Request.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {            
            if (reject.RequestError) {
                res.status(400).send(reject);
            } else {
                res.status(500).send(reject);
            }
        })
})
APP.delete(StoreManagerRoute, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!req.body.StreamerID)
                return ({ RequestError: "StreamerID is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    new dbStoreManager(Request.StreamerID).DeleteStoreItem(req.body.StoreItem)
        .then(async (result) => {
            await del('./uploads/'+Request.StreamerID+'/'+FolderTypes.StoreItem+Request.StoreItem.id+'/*');
            res.status(200).send(result);
        })
        .catch((reject) => {
            res.status(500).send(reject);
        })
})
APP.get(GetStoreRoute, async function (req: { params: { StreamerID: string, StoreItemID: string } }, res: express.Response) {
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
                res.status(500).send(rej);                
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
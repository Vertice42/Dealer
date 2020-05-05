import express = require("express");
import { APP } from "..";
import StoreManagerRequest from "../models/store/StoreManagerRequest";
import ControllerOfPermissions from "../controller/ControllerOfPermissions";
import StoreItem from "../models/store/StoreItem";
import { StoreManagerRoute, GetStoreRoute } from "./routes";
import del = require("del");
import FolderTypes from "../models/files_manager/FolderTypes";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";
import dbStoreManager from "../modules/databaseManager/store/dbStoreManager";
import CheckRequisition from "../utils/CheckRequisition";

APP.post(StoreManagerRoute, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;

    let ErrorList = CheckRequisition([
        () => {
            if (!Request.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!Request.StoreItem) {
                return ({ RequestError: "StoreItem is no defined" })
            }
        },
        () => {
            if (!Request.StoreItem) {
                return ({ RequestError: "StoreItem is no defined" })
            }
        },
        () => {
            if (!Request.StoreItem.id) {
                return ({ RequestError: "StoreItem ID is no defined" })
            }
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(Request.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;    

    if ((await new ControllerOfPermissions(StreamerID).ThereAreBlockedSettings(Request.StoreItem.ItemsSettings))) {       
        return res.status(423).send({ message: 'This feature is blocked for you' })
    }    

    new dbStoreManager(StreamerID).UpdateOrCreateStoreItem(Request.StoreItem)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((reject) => {
            console.error(reject);

            if (reject.RequestError) {
                res.status(400).send(reject);
            } else {
                console.error(reject);
                res.status(500).send(reject);
            }
        })
})
APP.delete(StoreManagerRoute, async function (req, res: express.Response) {
    let Request: StoreManagerRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!Request.Token)
                return ({ RequestError: "Token is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(Request.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;

    new dbStoreManager(StreamerID).DeleteStoreItem(req.body.StoreItem)
        .then(async (result) => {
            await del('./uploads/' + StreamerID + '/' + FolderTypes.StoreItem + Request.StoreItem.id + '/*');
            res.status(200).send(result);
        })
        .catch((reject) => {
            console.error(reject);
            res.status(500).send(reject);
        })
})
APP.get(GetStoreRoute, async function (req: { params: { StreamerID: string, StoreItemID: string } }, res: express.Response) {
    let dbStoreM = new dbStoreManager(req.params.StreamerID)

    if (req.params.StoreItemID === '-1') {
        dbStoreM.getAllItems()
            .then((dbStoreItems) => {
                let StoreItems: StoreItem[] = [];

                dbStoreItems.forEach((dbStoreItem, index) => {
                    StoreItems[index] =
                        new StoreItem(
                            dbStoreItem.id,
                            dbStoreItem.Type,
                            dbStoreItem.Description,
                            dbStoreItem.ItemsSettings,
                            dbStoreItem.FileName,
                            dbStoreItem.Price)
                });
                res.status(200).send(StoreItems);
            })
            .catch((rej) => {
                console.error(rej);
                res.status(500).send(rej);
            })

    } else {
        dbStoreM.getItem(Number(req.params.StoreItemID))
            .then((Item) => {
                res.status(200).send(<StoreItem>Item);
            })
            .catch((rej) => {
                console.error(rej);
                res.status(500).send(rej)
            })
    }

})
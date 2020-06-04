import express = require("express");
import { APP } from "..";
import { UpdateTransitionsByUser, GetTransitionsByUser } from "./routes";
import { UpdateTransitionsByUserRequest } from "../models/dealer/UpdateProductsPurchasedByUserRequest";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import { Authenticate } from "../modules/Authentication";
import { VerifyOwnershipOfProduct } from "../controller/ControllerOfPermissions";
import dbDealerManager from "../modules/databaseManager/dbDealerManager";
import CheckRequisition from "../utils/CheckRequisition";

APP.post(UpdateTransitionsByUser, async function (req, res: express.Response) {
    let Request: UpdateTransitionsByUserRequest = req.body;
    let ErrorList = CheckRequisition([
        () => {
            if (!Request.Token)
                return ({ RequestError: "Token is no defined" })
        },
        () => {
            if (!Request.Transaction)
                return ({ RequestError: "CurrentPollStatus is no defined" })
        },
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    if (!(await VerifyOwnershipOfProduct(Request.Transaction.product.sku, Request.Transaction.transactionID))) {
        return res.status(401).send({ ErrorList });
    }

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(Request.Token) }
    catch (error) { return res.status(401).send(error) }

    let StreamerID = Result.channel_id;
    new dbDealerManager(StreamerID).addTransactionOfUser(Request.Transaction)
        .then(result => {
            res.status(200).send(result);
        })
        .catch(rej => {
            console.error('Error in addTransactionOfUser',rej);
            res.status(500).send(rej);
        })
})

APP.get(GetTransitionsByUser, async function (req, res: express.Response) {
    let Token = <string>req.headers.token;

    let ErrorList = CheckRequisition([
        () => {
            if (!Token)
                return ({ RequestError: "Token is no defined" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList });

    let AuthResult: AuthenticateResult
    try { AuthResult = <AuthenticateResult>await Authenticate(Token) }
    catch (error) { return res.status(401).send(error) }

    new dbDealerManager(AuthResult.channel_id).getTransactionsOfUser(AuthResult.user_id)
        .then(result => {
            res.status(200).send((result) ? result.TransactionsArray : []);
        })
        .catch(rej => {
            console.error('Error in getTransactionsOfUser',rej);
            res.status(500).send(rej);
        })
})
import express = require("express");
import fs = require('fs');
import path = require('path');

import { APP } from "..";
import UploadFileResponse from "../models/files_manager/UploadFileResponse";
import { UploadFileRoute, GetFileRoute, GetWalletSkinImage, GetWalletSkins, GetLocale } from "./routes";
import { getSocketOfStreamer } from "../modules/SocketsManager";
import IOListeners from "../models/listeners/IOListeners";
import { Authenticate } from "../modules/Authentication";
import { AuthenticateResult } from "../models/poll/AuthenticateResult";
import del = require("del");
import CheckRequisition from "../utils/CheckRequisition";

APP.post(UploadFileRoute, async function (req, res: express.Response) {
    let ErrorList = CheckRequisition([
        () => {
            if (!(typeof req.headers["token"] === 'string'))
                return ({ RequestError: "StreamerID is no a string" })
        },
        () => {
            if (!(typeof req.headers["file-id"] === 'string'))
                return ({ RequestError: "Folder Name is no a string" })
        },
        () => {
            if (!(typeof req.headers["file-name"] === 'string'))
                return ({ RequestError: "File Name is no a string" })
        }
    ])
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });

    const Token = <string>req.headers["token"];
    const FileID = <string>req.headers["file-id"];
    const FileName = <string>req.headers["file-name"];

    let Result: AuthenticateResult
    try { Result = <AuthenticateResult>await Authenticate(Token) }
    catch (error) { return res.status(401).send(error) }

    const StreamerID = Result.channel_id;

    let Dir = `./uploads/${StreamerID}`;

    if (!fs.existsSync(Dir)) {
        await fs.promises.mkdir(Dir);
    }

    Dir = `${Dir}/${FileID}`;

    if (fs.existsSync(Dir)) {
        del.sync(Dir + '/*');
    } else {
        await fs.promises.mkdir(Dir);
    }

    let fileSize = Number(req.headers['content-length']);

    if (fileSize > 10 * 1024 * 1024)
        return res.status(400).send({ RequestError: "The file size is greater than 10mb" });

    let file = fs.createWriteStream(`${Dir}/${FileName}`);

    req.on('data', chunk => {
        file.write(chunk);
        let UploadPercentage = (file.bytesWritten / fileSize) * 100;
        getSocketOfStreamer(StreamerID).forEach(socket => {
            socket.emit(IOListeners.UploadProgress, UploadPercentage);
        })
    })
    req.on('end', async () => {
        file.end();
        file = null;

        res.status(200).send(new UploadFileResponse(FileName, new Date));
    })
})

APP.get(GetFileRoute, async function (req, res: express.Response) {
    res.status(200).sendFile(path.resolve(`./uploads/${req.params.StreamerID}/${req.params.Folder}/${req.params.FileName}`))
})

APP.get(GetWalletSkinImage, async function (req, res: express.Response) {
    res.status(200).sendFile(path.resolve(`./configs/WalletSkins/${req.params.SkinImageName}/mask_${req.params.MaskNumber}.png`))
})

APP.get(GetWalletSkins, async function (req, res: express.Response) {
    res.status(200).sendFile(path.resolve(`./configs/WalletSkins.json`))
})

APP.get(GetLocale, async function (req, res: express.Response) {
    let Path = path.resolve(`./configs/locales/${req.params.ViewName}/${req.params.Language}.json`);

    fs.open(Path, 'r', (err, fd) => {
        if (err) {
            if (err.code === 'ENOENT') {
                Path = path.resolve(`./configs/locales/${req.params.ViewName}/en.json`);
                res.status(200).sendFile(Path);
            } else {
                throw err;
            }
        } else {
            res.status(200).sendFile(Path);
        }
    });
})
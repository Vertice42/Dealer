import express = require("express");
import fs = require('fs');
import del = require('del');
import path = require('path');

import { APP, CheckRequisition } from "..";
import UploadFileResponse from "../models/files_manager/UploadFileResponse";
import { UploadFileRoute, GetFileRoute as GetUploadedFile, GetWalletSkinImage, GetWalletSkins, GetLocale } from "./routes";
import { getSoketOfStreamer } from "../SocketsManager";
import IOListeners from "../IOListeners";

APP.post(UploadFileRoute, async function (req, res: express.Response) {

    let ErrorList = CheckRequisition([
        () => {
            if (!(typeof req.headers["streamer-id"] === 'string'))
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

    const StreamerID = <string>req.headers["streamer-id"];
    const FileID = <string>req.headers["file-id"];
    const FileName = <string>req.headers["file-name"];

    let dir = `uploads/${StreamerID}/${FileID}`;

    if (fs.existsSync(dir)) {
        del.sync(dir + '/*');
    } else {
        await fs.promises.mkdir('./' + dir);
    }

    let fileSize = Number(req.headers['content-length']);

    let file = fs.createWriteStream('./' + dir + '/' + FileName);

    req.on('data', chunk => {
        file.write(chunk);
        let UploadPercentage = (file.bytesWritten / fileSize) * 100;
        getSoketOfStreamer(StreamerID).forEach(socket => {
            socket.emit(IOListeners.UploadProgress, UploadPercentage);
        })
    })
    req.on('end', async () => {
        file.end();
        file = null;

        res.status(200).send(new UploadFileResponse(FileName, new Date));
    })
})

APP.get(GetUploadedFile, async function (req, res: express.Response) {
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
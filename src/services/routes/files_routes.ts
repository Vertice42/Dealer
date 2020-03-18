import express = require("express");
import fs = require('fs');
import del = require('del');
import path = require('path');

import { APP, CheckRequisition } from "..";
import UploadFileResponse from "../models/files_manager/UploadFileResponse";
import { UploadFileRoute, GetFileRoute } from "./routes";

APP.post(UploadFileRoute, async function (req, res: express.Response) {    
    let ErrorList = CheckRequisition([
        () => {
            if (!req.headers["streamer-id"])
                return ({ RequestError: "StreamerID is no defined" })
        },
        () => {
            if (!req.headers["folder-name"])
                return ({ RequestError: "Folder Name is no defined" })
        },
        () => {
            if (!req.headers["file-name"])
                return ({ RequestError: "File Name is no defined" })
        }
    ])
    
    if (ErrorList.length > 0) return res.status(400).send({ ErrorList: ErrorList });
        
    let dir = `./uploads/${req.headers["streamer-id"]}/${req.headers["folder-name"]}`;

    if (fs.existsSync(dir)) await del(dir);

    await fs.promises.mkdir(dir);

    let file = fs.createWriteStream(dir + '/' + req.headers["file-name"]);
    req.on('data', chunk => {
        file.write(chunk);
    })
    req.on('end', () => {
        file.end();
        res.status(200).send(new UploadFileResponse(<string>req.headers["file-name"], new Date));
    })
})

APP.get(GetFileRoute, async function (req, res: express.Response) {    
    res.status(200).sendFile(path.resolve(`./uploads/${req.params.StreamerID}/${req.params.Folder}/${req.params.FileName}`))
})


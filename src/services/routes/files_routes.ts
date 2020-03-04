import express = require("express");
import fs = require('fs');
import path = require('path');

import { APP } from "..";
import UploadFileResponse from "../models/files_manager/UploadFileResponse";
import Links from "../Links";

APP.post(Links.UploadFile, async function (req, res: express.Response) {
    //TODO ON UPDATE REMOVER ANTIGO
    let dir = `./uploads/${req.headers["streamer-id"]}`;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    let file = fs.createWriteStream(dir + '/' + req.headers["file-name"]);

    req.on('data', chunk => {
        file.write(chunk);
    })
    req.on('end', () => {
        file.end();
        res.status(200).send(new UploadFileResponse(<string>req.headers["file-name"], new Date));
    })
})

APP.get(Links.GetFile, async function (req, res: express.Response) {
    res.status(200).sendFile(path.resolve(`./uploads/${req.params.StreamerID}/${req.params.FileName}`))
})
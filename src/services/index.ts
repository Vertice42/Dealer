import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import http = require('http')
import Socket_io = require('socket.io')
import { Loading } from "./modules/database/dbLoading";
import IOListeners from "./IOListeners";
import { dbManager } from "./modules/database/dbManager";
import { addSocketOfStreamer, removeSocketOfStreamer } from "./SocketsManager";

export function CheckRequisition(CheckList: (() => Object)[]) {
    let ErrorList = [];
    CheckList.forEach(Check => {
        let fail = Check();
        if (fail) ErrorList.push(fail)
    });
    return ErrorList
}
export const APP = express();
const SERVER = http.createServer(APP);

var AcceptedOrigin = process.env.AcceptedOrigin;


if (process.env.NODE_ENV !== 'production') AcceptedOrigin = 'http://localhost';

function ValidateOrigin(origin: string, i = 0) {
    if (origin.charAt(i) === AcceptedOrigin.charAt(i)) {
        i++;
        return ValidateOrigin(origin, i);
    } else {
        return (i > AcceptedOrigin.length - 1)
    }
}

var corsOptionsDelegate = function (req: express.Request, callback) {
    var corsOptions:cors.CorsOptions;

    if (req.method !== 'GET') {
        corsOptions = { origin: ValidateOrigin(req.header('Origin')) }
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

APP.use(cors(corsOptionsDelegate));
APP.use(bodyParser.json());

require('./routes/poll_routes');
require('./routes/miner_routes');
require('./routes/streamer_settings_routes');
require('./routes/store_routes');
require('./routes/purchase_orders_routes');
require('./routes/wallets_routes');
require('./routes/files_routes');
require('./routes/products_routes');

const IO = Socket_io(SERVER).listen(SERVER);
IO.on('connection', (socket) => {
    socket.on(IOListeners.RegisterStreamer, async (StreamerID) => {

        if (!dbManager.getAccountData(StreamerID))
            dbManager.setAccountData(await Loading.StreamerAccountData(StreamerID));

        console.log('connected', StreamerID);
        socket.emit(IOListeners.onStreamerAsRegistered);
        addSocketOfStreamer(StreamerID, socket);

        socket.on('disconnect', () => {
            console.log('disconnect');
            removeSocketOfStreamer(StreamerID, socket, () => {
                if (dbManager.getAccountData(StreamerID)) {
                    dbManager.removeAccountData(StreamerID);
                    console.log('empty');
                }
            })
        })
    });

});

SERVER.on('listening', () => console.log('**** SERVER AS STARTED ****'));
console.log(process.env);

SERVER.listen(process.env.Door);
import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import http = require('http');
import Socket_io = require('socket.io')
import IOListeners from "./models/listeners/IOListeners";
import { addSocketOfStreamer, removeSocketOfStreamer } from "./modules/SocketsManager";
import dbManager from "./modules/databaseManager/dbManager";
import Loading from "./modules/databaseManager/dbLoading";

export const APP = express();
export const SERVER = http.createServer(APP);
export const IO = Socket_io(SERVER).listen(SERVER);

APP.use(cors(function (req: express.Request, callback) {
    var corsOptions: cors.CorsOptions;

    function ValidateOrigin(origin: string, i = 0) {
        if (origin.charAt(i) === process.env.AcceptedOrigin.charAt(i)) {
            i++;
            return ValidateOrigin(origin, i);
        } else {
            return (i > process.env.AcceptedOrigin.length - 1)
        }
    }
    if (req.method !== 'GET') {
        corsOptions = { origin: ValidateOrigin(req.header('Origin')) }
    }
    callback(null, corsOptions)
}));
APP.use(bodyParser.json());

require('./routes/pages')
require('./routes/poll_routes');
require('./routes/miner_routes');
require('./routes/streamer_settings_routes');
require('./routes/store_routes');
require('./routes/purchase_orders_routes');
require('./routes/wallets_routes');
require('./routes/files_routes');
require('./routes/products_routes');

IO.on('connection', (socket) => {
    socket.on(IOListeners.RegisterStreamer, async (StreamerID) => {
        if (!dbManager.getAccountData(StreamerID))
            dbManager.setAccountData(await Loading.StreamerAccountData(StreamerID));

        console.log(StreamerID + ' socket connected');
        socket.emit(IOListeners.onStreamerAsRegistered);
        addSocketOfStreamer(StreamerID, socket);

        socket.on('disconnect', () => {
            console.log(StreamerID + 'socket disconnect');
            removeSocketOfStreamer(StreamerID, socket, () => {
                if (dbManager.getAccountData(StreamerID)) {
                    dbManager.removeAccountData(StreamerID);
                    console.log(StreamerID + ' is completely disconnected');
                }
            })
        })
    });

});
SERVER.on('listening', () => console.log('**** SERVER AS STARTED ****'));
SERVER.listen(process.env.PORT);
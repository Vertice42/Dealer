import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import http = require('http')
import Socket_io = require('socket.io')
import ServerConfigs from "./configs/ServerConfigs";

export function CheckRequisition(CheckList: (() => Object)[]) {
    let ErrorList = [];
    CheckList.forEach(chekage => {
        let fail = chekage();
        if (fail) ErrorList.push(fail)
    });
    return ErrorList
}

var Sockets: Socket_io.Socket[] = [];
export function getSoketOfStreamer(StreamerID: string): Socket_io.Socket {
    return Sockets[StreamerID];
}

export const APP = express();
const SERVER = http.createServer(APP);

APP.use(cors());
APP.use(bodyParser.json());

require('./routes/poll_routes');
require('./routes/miner_routes');
require('./routes/streamer_settings_routes');
require('./routes/store_routes');
require('./routes/purchase_orders_routes');
require('./routes/wallets_routes');
require('./routes/files_routes');
 
const IO = Socket_io(SERVER).listen(SERVER);
IO.on('connect', (socket) => {
    socket.on('registered', (StreamerID) => {
        Sockets[StreamerID] = socket;
    })
});

SERVER.on('listening', () => console.log('**** SERVER AS STARTDED ****'));
SERVER.listen(ServerConfigs.Port);
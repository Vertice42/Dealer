import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import http = require('http')
import ServerConfigs from "./configs/ServerConfigs";
import Socket_io = require('socket.io')
import { Loading } from "./modules/database/dbLoading";
import IOListeners from "./IOListeners";
import { dbManager } from "./modules/database/dbManager";
import { addSoketOfStreamer, removeSoketOfStreamer } from "./SocketsManager";

export function CheckRequisition(CheckList: (() => Object)[]) {
    let ErrorList = [];
    CheckList.forEach(chekage => {
        let fail = chekage();
        if (fail) ErrorList.push(fail)
    });
    return ErrorList
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
IO.on('connection', (socket) => {
    socket.on(IOListeners.RegisterStreamer, async (StreamerID) => {

        if (!dbManager.getAccountData(StreamerID))
            dbManager.setAccountData(await Loading.StreamerAccountData(StreamerID));

        console.log('conectd', StreamerID);
        socket.emit(IOListeners.onStreamerAsRegistered);
        addSoketOfStreamer(StreamerID, socket);

        socket.on('disconnect', () => {
            console.log('disconnect');
            removeSoketOfStreamer(StreamerID, socket, () => {
                if (dbManager.getAccountData(StreamerID)) {
                    dbManager.removeAccountData(StreamerID);
                    console.log('empty');
                }
            })
        })
    });

});

SERVER.on('listening', () => console.log('**** SERVER AS STARTDED ****'));
SERVER.listen(ServerConfigs.Port);
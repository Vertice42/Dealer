import Socket_io = require('socket.io')

var Sockets: Socket_io.Socket[][] = [];
export function getSoketOfStreamer(StreamerID: string): Socket_io.Socket[] {
    return Sockets[StreamerID];
}

export function addSoketOfStreamer(StreamerID: string, Socket_io: Socket_io.Socket) {
    let sockets = getSoketOfStreamer(StreamerID);
    if (!sockets) sockets = Sockets[StreamerID] = []
    sockets.push(Socket_io);
}

export function removeSoketOfStreamer(StreamerID: string, Socket_io: Socket_io.Socket, onEmpty: () => any) {
    let sockets = getSoketOfStreamer(StreamerID);
    if (sockets) {
        sockets.splice(sockets.findIndex(socket => {
            return socket.id === Socket_io.id;
        }), 1);
        if (sockets.length < 1) onEmpty();
    }
}
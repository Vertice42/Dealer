import Socket_io = require('socket.io')

var Sockets: Socket_io.Socket[][] = [];
export function getSocketOfStreamer(StreamerID: string): Socket_io.Socket[] {
    return Sockets[StreamerID];
}

export function addSocketOfStreamer(StreamerID: string, Socket_io: Socket_io.Socket) {
    let sockets = getSocketOfStreamer(StreamerID);
    if (!sockets) sockets = Sockets[StreamerID] = []
    sockets.push(Socket_io);
}

export function removeSocketOfStreamer(StreamerID: string, Socket_io: Socket_io.Socket, onEmpty: () => any) {
    let sockets = getSocketOfStreamer(StreamerID);
    if (sockets) {
        sockets.splice(sockets.findIndex(socket => {
            return socket.id === Socket_io.id;
        }), 1);
        if (sockets.length < 1) onEmpty();
    }
}
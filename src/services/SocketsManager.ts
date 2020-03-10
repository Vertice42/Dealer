import Socket_io = require('socket.io')

export var Sockets: Socket_io.Socket[] = [];
export function getSoketOfStreamer(StreamerID: string): Socket_io.Socket {
    return Sockets[StreamerID];
}
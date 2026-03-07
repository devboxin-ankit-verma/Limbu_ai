/**
 * Socket.IO server setup. Attached to HTTP server; services can emit via app.get('io').
 */

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.socketCorsOrigins,
      credentials: true
    },
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    // Optional: verify JWT from handshake auth for namespaces
    socket.on('disconnect', () => {});
  });

  return io;
}

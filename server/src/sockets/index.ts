import { Server } from 'socket.io';
import http from 'http';

export const initSockets = (server: http.Server) => {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);
  });

  return io;
};

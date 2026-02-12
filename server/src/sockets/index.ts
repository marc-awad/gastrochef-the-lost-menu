import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import {
  initOrderSystem,
  startOrderGeneratorForUser,
  stopOrderGeneratorForUser,
} from '../modules/orderGenerator';

// ─── Types ────────────────────────────────────────────────────
interface AuthenticatedSocket extends Socket {
  userId?: number;
}

// ─── Helper : room d'un utilisateur ──────────────────────────
export const userRoom = (userId: number) => `user:${userId}`;

// ─── Init Socket.io ──────────────────────────────────────────
export const initSockets = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── Système de commandes (expiry watcher global) ────────────
  initOrderSystem(io);

  // ══════════════════════════════════════════════════════════
  //  MIDDLEWARE D'AUTHENTIFICATION JWT
  // ══════════════════════════════════════════════════════════
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        console.warn('🔒 Socket rejeté : pas de token');
        return next(new Error('Authentication error: no token provided'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('❌ JWT_SECRET manquant dans .env');
        return next(new Error('Server configuration error'));
      }

      const decoded = jwt.verify(token as string, secret) as { id: number };
      socket.userId = decoded.id;

      console.log(`🔑 Socket auth OK — userId: ${decoded.id}`);
      next();
    } catch (err) {
      console.warn('🔒 Socket rejeté : token invalide', (err as Error).message);
      next(new Error('Authentication error: invalid token'));
    }
  });

  // ══════════════════════════════════════════════════════════
  //  CONNEXION
  // ══════════════════════════════════════════════════════════
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    console.log(`⚡ [CONNECT] socketId=${socket.id} | userId=${userId}`);

    // ── Room personnelle ────────────────────────────────────
    const room = userRoom(userId);
    socket.join(room);
    console.log(`🏠 userId=${userId} a rejoint la room "${room}"`);

    // ── Confirmation au client ──────────────────────────────
    socket.emit('connected', {
      message: 'Connexion WebSocket établie',
      userId,
      socketId: socket.id,
      room,
    });

    // ── Démarrer la génération de commandes ─────────────────
    startOrderGeneratorForUser(io, userId);

    // ── Ping / Pong (debug) ─────────────────────────────────
    socket.on('ping', () => {
      console.log(`🏓 Ping reçu de userId=${userId}`);
      socket.emit('pong', { timestamp: Date.now() });
    });

    // ── Déconnexion ─────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(
        `💤 [DISCONNECT] socketId=${socket.id} | userId=${userId} | raison: ${reason}`
      );
      stopOrderGeneratorForUser(userId);
    });

    // ── Erreur socket ────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(
        `❌ [ERROR] socketId=${socket.id} | userId=${userId}`,
        err.message
      );
    });
  });

  console.log('✅ Socket.io initialisé');
  return io;
};

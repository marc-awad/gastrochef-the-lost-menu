import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Order } from '../models/Order';
import {
  initOrderSystem,
  startOrderGeneratorForUser,
  stopOrderGeneratorForUser,
} from '../modules/orderGenerator';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

export const userRoom = (userId: number) => `user:${userId}`;

export const initSockets = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  initOrderSystem(io);

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication error: no token'));

      const secret = process.env.JWT_SECRET;
      if (!secret) return next(new Error('Server configuration error'));

      const decoded = jwt.verify(token as string, secret) as { id: number };
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`⚡ [CONNECT] socketId=${socket.id} | userId=${userId}`);

    // ✅ NOUVEAU : Nettoyer les vieilles commandes pending expirées SANS pénalité
    // Elles datent d'une session précédente — les pénaliser maintenant serait injuste
    try {
      const cleaned = await Order.destroy({
        where: {
          user_id: userId,
          status: 'pending',
          expires_at: { [Op.lt]: new Date() },
        },
      });
      if (cleaned > 0) {
        console.log(
          `🧹 [CONNECT] ${cleaned} vieille(s) commande(s) pending nettoyée(s) sans pénalité pour userId=${userId}`
        );
      }
    } catch (err) {
      console.error(`❌ [CONNECT] Erreur nettoyage vieilles commandes:`, err);
    }

    const room = userRoom(userId);
    socket.join(room);

    // ✅ NOUVEAU : Envoyer les vraies stats depuis la BDD au moment de la connexion
    try {
      const user = await User.findByPk(userId);
      if (user) {
        console.log(
          `📊 [CONNECT] Stats BDD userId=${userId} — satisfaction=${user.satisfaction} | treasury=${user.treasury} | stars=${user.stars}`
        );
        socket.emit('stats_update', {
          satisfaction: user.satisfaction,
          treasury: user.treasury,
          stars: user.stars,
        });
      }
    } catch (err) {
      console.error(`❌ [CONNECT] Erreur récupération stats:`, err);
    }

    socket.emit('connected', {
      message: 'Connexion WebSocket établie',
      userId,
      socketId: socket.id,
      room,
    });

    startOrderGeneratorForUser(io, userId);

    socket.on('ping', () => socket.emit('pong', { timestamp: Date.now() }));

    socket.on('disconnect', (reason) => {
      console.log(
        `💤 [DISCONNECT] socketId=${socket.id} | userId=${userId} | raison: ${reason}`
      );
      stopOrderGeneratorForUser(userId);
    });

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

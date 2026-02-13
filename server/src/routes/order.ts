import express from 'express';
import {
  serveOrder,
  getOrders,
  cleanupExpiredOrders,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { resetGame } from '../controllers/resetController';

const router = express.Router();

/**
 * 📋 GET /api/orders
 * Récupérer toutes les commandes en attente de l'utilisateur
 */
router.get('/', authMiddleware, getOrders);

/**
 * 🍽️ POST /api/orders/serve/:orderId
 * Servir une commande spécifique
 */
router.post('/serve/:orderId', authMiddleware, serveOrder);

/**
 * 🗑️ POST /api/orders/cleanup-expired
 * Nettoyer les commandes expirées (appel périodique ou manuel)
 */
router.post('/cleanup-expired', authMiddleware, cleanupExpiredOrders);
router.post('/reset', authMiddleware, resetGame);

export default router;

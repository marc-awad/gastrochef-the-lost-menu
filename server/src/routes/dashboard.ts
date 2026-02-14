import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getTransactions,
  getDashboardStats,
} from '../controllers/dashboardController';

const router = Router();

/**
 * 📋 GET /api/transactions
 * Historique des transactions avec pagination et filtres
 * Query: ?page=1&limit=20&type=order_revenue
 */
router.get('/transactions', authMiddleware, getTransactions);

/**
 * 📊 GET /api/dashboard/stats
 * Données agrégées pour le dashboard (graphiques + rentabilité)
 */
router.get('/dashboard/stats', authMiddleware, getDashboardStats);

export default router;

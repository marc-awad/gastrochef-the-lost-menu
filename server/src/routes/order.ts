import { Router } from 'express';
import { serveOrder, getActiveOrders } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ── POST /api/orders/serve ─────────────────────────────────────
// Servir une commande
router.post('/serve', authMiddleware, serveOrder);

// ── GET /api/orders/active ──────────────────────────────────────
// Récupérer toutes les commandes actives
router.get('/active', authMiddleware, getActiveOrders);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  buyIngredient,
  getInventory,
} from '../controllers/marketplaceController';

const router = Router();

// GET  /api/inventory         → Stock actuel de l'utilisateur
router.get('/inventory', authMiddleware, getInventory);

// POST /api/marketplace/buy   → Acheter des ingrédients
router.post('/marketplace/buy', authMiddleware, buyIngredient);

export default router;

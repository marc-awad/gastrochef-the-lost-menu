import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Recipe } from '../models/Recipe';
import { User } from '../models/User';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { RecipeIngredient } from '../models/RecipeIngredient';
import { Ingredient } from '../models/Ingredient';

interface AuthRequest extends Request {
  userId?: number;
}

// ─── Servir une commande ──────────────────────────────────────
export const serveOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { orderId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  if (!orderId) {
    return res.status(400).json({ message: 'orderId requis' });
  }

  try {
    // 1. Récupérer la commande
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: 'pending',
      },
      include: [{ model: Recipe, as: 'recipe' }],
    });

    if (!order) {
      return res.status(404).json({
        message: 'Commande introuvable ou déjà servie',
      });
    }

    // 2. Vérifier si la commande n'est pas expirée
    if (new Date() > order.expires_at) {
      await order.update({ status: 'expired' });
      return res.status(400).json({
        message: 'Commande expirée',
      });
    }

    // 3. Vérifier que le joueur a découvert la recette
    const discovered = await UserDiscoveredRecipe.findOne({
      where: {
        user_id: userId,
        recipe_id: order.recipe_id,
      },
    });

    if (!discovered) {
      return res.status(403).json({
        message: "Vous n'avez pas encore découvert cette recette",
      });
    }

    // 4. NIVEAU 13 : Pas de vérification de stock, pas de trésorerie
    // On sert directement la commande

    // 5. Marquer la commande comme servie
    await order.update({ status: 'served' });

    // 6. Mettre à jour la satisfaction (+1 point)
    const user = await User.findByPk(userId);
    if (user) {
      const newSatisfaction = user.satisfaction + 1;
      await user.update({ satisfaction: newSatisfaction });

      return res.status(200).json({
        success: true,
        message: 'Commande servie avec succès !',
        data: {
          orderId: order.id,
          price: order.price,
          satisfaction: newSatisfaction,
          isVip: order.is_vip,
        },
      });
    }

    return res.status(500).json({
      message: 'Erreur lors de la mise à jour de la satisfaction',
    });
  } catch (error) {
    console.error('❌ [SERVE ORDER] Erreur:', (error as Error).message);
    return res.status(500).json({
      message: 'Erreur serveur',
      error: (error as Error).message,
    });
  }
};

// ─── Récupérer toutes les commandes actives d'un joueur ────────
export const getActiveOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const orders = await Order.findAll({
      where: {
        user_id: userId,
        status: 'pending',
      },
      include: [{ model: Recipe, as: 'recipe' }],
      order: [['created_at', 'ASC']],
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      recipe_id: order.recipe_id,
      recipe_name: (order as any).recipe?.name || 'Inconnue',
      price: order.price,
      expires_at: order.expires_at,
      is_vip: order.is_vip,
      created_at: order.created_at,
    }));

    return res.status(200).json({
      success: true,
      orders: formatted,
    });
  } catch (error) {
    console.error('❌ [GET ORDERS] Erreur:', (error as Error).message);
    return res.status(500).json({
      message: 'Erreur serveur',
      error: (error as Error).message,
    });
  }
};

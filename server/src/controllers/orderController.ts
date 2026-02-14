import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  Order,
  User,
  Recipe,
  UserDiscoveredRecipe,
  Inventory,
  Transaction,
} from '../models';
import { RecipeIngredient } from '../models';
import sequelize from '../config/db';
import { io } from '../app';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

/** Émet stats_update + game_over si nécessaire */
const emitStats = (
  userId: number,
  satisfaction: number,
  treasury: number,
  stars: number
) => {
  io.to(`user:${userId}`).emit('stats_update', {
    satisfaction,
    treasury,
    stars,
  });
  io.to(`user:${userId}`).emit('treasury_updated', { treasury }); // ✅ TICKET #017

  if (satisfaction < 0) {
    io.to(`user:${userId}`).emit('game_over', {
      reason: 'satisfaction',
      satisfaction,
    });
  }
  if (treasury < 0) {
    io.to(`user:${userId}`).emit('game_over', { reason: 'treasury', treasury });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/orders/serve/:orderId
// ─────────────────────────────────────────────────────────────
export const serveOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const orderIdNum = parseInt(
      Array.isArray(orderId) ? orderId[0] : orderId,
      10
    );

    if (isNaN(orderIdNum)) {
      await transaction.rollback();
      res
        .status(400)
        .json({ success: false, message: 'ID de commande invalide' });
      return;
    }

    if (!userId) {
      await transaction.rollback();
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    // ── 1. Récupérer la commande avec sa recette et ses ingrédients ──
    const order = await Order.findOne({
      where: { id: orderIdNum },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'sale_price'],
          include: [
            {
              model: RecipeIngredient,
              as: 'recipeIngredients',
              attributes: ['ingredient_id', 'quantity'],
            },
          ],
        },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      res.status(404).json({ success: false, message: 'Commande introuvable' });
      return;
    }

    if (order.user_id !== userId) {
      await transaction.rollback();
      res
        .status(403)
        .json({
          success: false,
          message: 'Cette commande ne vous appartient pas',
        });
      return;
    }

    if (order.status === 'served') {
      await transaction.rollback();
      res
        .status(400)
        .json({ success: false, message: 'Cette commande a déjà été servie' });
      return;
    }

    const user = await User.findOne({ where: { id: userId }, transaction });
    if (!user) {
      await transaction.rollback();
      res
        .status(500)
        .json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    const currentTreasury = parseFloat(String(user.treasury));
    const currentSatisfaction = user.satisfaction;
    const currentStars = user.stars;

    // ── 2. Commande expirée ────────────────────────────────────────
    const now = new Date();
    const isExpired = new Date(order.expires_at) < now;

    if (isExpired) {
      await order.update({ status: 'expired' }, { transaction });

      const satisfactionPenalty = order.is_vip ? 20 : 10;
      const financialPenalty = order.is_vip
        ? parseFloat(String(order.price)) * 0.5 // VIP : -50% du prix
        : Math.min(50, parseFloat(String(order.price)) * 0.1); // Normal : -10% du prix (max 50€)

      const newSatisfaction = currentSatisfaction - satisfactionPenalty;
      const newTreasury = parseFloat(
        (currentTreasury - financialPenalty).toFixed(2)
      );

      await user.update(
        { satisfaction: newSatisfaction, treasury: newTreasury },
        { transaction }
      );

      // Créer une transaction financière de type 'penalty'
      await Transaction.create(
        {
          user_id: userId,
          type: 'vip_penalty',
          amount: -financialPenalty,
          description: `Pénalité commande expirée : ${(order as any).recipe?.name ?? 'Recette inconnue'}${order.is_vip ? ' (VIP)' : ''}`,
          balance_after: newTreasury,
          created_at: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      emitStats(userId, newSatisfaction, newTreasury, currentStars);

      const isGameOver = newSatisfaction < 0 || newTreasury < 0;

      res.status(400).json({
        success: false,
        message: `Commande expirée ! (-${satisfactionPenalty} satisfaction, -${financialPenalty.toFixed(2)}€)`,
        data: {
          satisfaction: newSatisfaction,
          treasury: newTreasury,
          gameOver: isGameOver,
          gameOverReason:
            newSatisfaction < 0
              ? 'satisfaction'
              : newTreasury < 0
                ? 'treasury'
                : null,
        },
      });
      return;
    }

    // ── 3. Vérifier que la recette est découverte ──────────────────
    const discoveredRecipe = await UserDiscoveredRecipe.findOne({
      where: { user_id: userId, recipe_id: order.recipe_id },
      transaction,
    });

    if (!discoveredRecipe) {
      await transaction.rollback();
      res
        .status(400)
        .json({
          success: false,
          message: "Vous n'avez pas encore découvert cette recette !",
        });
      return;
    }

    // ── 4. Vérifier le stock des ingrédients ──────────────────────
    const recipeIngredients: Array<{
      ingredient_id: number;
      quantity: number;
    }> = (order as any).recipe?.recipeIngredients ?? [];

    if (recipeIngredients.length === 0) {
      await transaction.rollback();
      res
        .status(400)
        .json({ success: false, message: 'Recette sans ingrédients définis' });
      return;
    }

    const insufficientIngredients: Array<{
      ingredient_id: number;
      required: number;
      available: number;
    }> = [];

    for (const ri of recipeIngredients) {
      const stock = await Inventory.findOne({
        where: { user_id: userId, ingredient_id: ri.ingredient_id },
        transaction,
      });

      const available = stock?.quantity ?? 0;
      if (available < ri.quantity) {
        insufficientIngredients.push({
          ingredient_id: ri.ingredient_id,
          required: ri.quantity,
          available,
        });
      }
    }

    if (insufficientIngredients.length > 0) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Stock insuffisant pour préparer cette recette',
        data: { insufficientIngredients },
      });
      return;
    }

    // ── 5. Déduire les ingrédients du stock ───────────────────────
    for (const ri of recipeIngredients) {
      const stock = await Inventory.findOne({
        where: { user_id: userId, ingredient_id: ri.ingredient_id },
        transaction,
      });

      if (stock) {
        const newQty = stock.quantity - ri.quantity;
        if (newQty <= 0) {
          // Supprimer la ligne si stock tombe à 0
          await Inventory.destroy({
            where: { user_id: userId, ingredient_id: ri.ingredient_id },
            transaction,
          });
        } else {
          await Inventory.update(
            { quantity: newQty },
            {
              where: { user_id: userId, ingredient_id: ri.ingredient_id },
              transaction,
            }
          );
        }
      }
    }

    // ── 6. Mettre à jour la commande, satisfaction et trésorerie ──
    await order.update({ status: 'served' }, { transaction });

    const satisfactionBonus = order.is_vip ? 5 : 1;
    const orderPrice = parseFloat(String(order.price));
    const newSatisfaction = currentSatisfaction + satisfactionBonus;
    const newTreasury = parseFloat((currentTreasury + orderPrice).toFixed(2));

    await user.update(
      { satisfaction: newSatisfaction, treasury: newTreasury },
      { transaction }
    );

    // ── 7. Créer une transaction financière de type 'order_revenue' ──
    await Transaction.create(
      {
        user_id: userId,
        type: 'order_revenue',
        amount: orderPrice,
        description: `Vente : ${(order as any).recipe?.name ?? 'Recette inconnue'}${order.is_vip ? ' (VIP ⭐)' : ''}`,
        balance_after: newTreasury,
        created_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    emitStats(userId, newSatisfaction, newTreasury, currentStars);

    // Game Over check (cas rare : treasury négative après une vente n'arrive pas,
    // mais on garde la logique complète pour cohérence)
    const isGameOver =
      newSatisfaction < 0 || newTreasury < 0 || currentStars < 1;

    res.status(200).json({
      success: true,
      message: order.is_vip
        ? `⭐ Commande VIP servie ! (+${satisfactionBonus} satisfaction, +${orderPrice.toFixed(2)}€)`
        : `Commande servie ! (+${satisfactionBonus} satisfaction, +${orderPrice.toFixed(2)}€)`,
      data: {
        orderId: order.id,
        satisfaction: newSatisfaction,
        treasury: newTreasury,
        recipeName: (order as any).recipe?.name ?? 'Recette inconnue',
        isVip: order.is_vip,
        satisfactionBonus,
        gameOver: isGameOver,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du service de la commande:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'Erreur serveur lors du service de la commande',
      });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/orders
// ─────────────────────────────────────────────────────────────
export const getOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const orders = await Order.findAll({
      where: { user_id: userId, status: 'pending' },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'description', 'sale_price'],
        },
      ],
      order: [['expires_at', 'ASC']],
    });

    const formattedOrders = orders.map((order) => {
      const orderData = order.toJSON() as any;
      return {
        id: orderData.id,
        recipe_id: orderData.recipe_id,
        recipe_name: orderData.recipe?.name || 'Recette inconnue',
        price: parseFloat(orderData.price),
        expires_at: orderData.expires_at,
        is_vip: orderData.is_vip,
        created_at: orderData.created_at,
      };
    });

    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/orders/cleanup-expired
// ─────────────────────────────────────────────────────────────
export const cleanupExpiredOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.userId;

    if (!userId) {
      await transaction.rollback();
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    const now = new Date();

    const expiredOrders = await Order.findAll({
      where: { user_id: userId, status: 'pending' },
      transaction,
    });

    const reallyExpired = expiredOrders.filter(
      (order) => new Date(order.expires_at) < now
    );

    if (reallyExpired.length > 0) {
      const expiredIds = reallyExpired.map((o) => o.id);

      await Order.update(
        { status: 'expired' },
        { where: { id: expiredIds }, transaction }
      );

      const satisfactionPenalty = reallyExpired.reduce(
        (total, order) => total + (order.is_vip ? 20 : 10),
        0
      );
      const financialPenalty = reallyExpired.reduce((total, order) => {
        const p = order.is_vip
          ? parseFloat(String(order.price)) * 0.5
          : Math.min(50, parseFloat(String(order.price)) * 0.1);
        return total + p;
      }, 0);

      const user = await User.findOne({ where: { id: userId }, transaction });

      if (user) {
        const newSatisfaction = user.satisfaction - satisfactionPenalty;
        const newTreasury = parseFloat(
          (parseFloat(String(user.treasury)) - financialPenalty).toFixed(2)
        );

        await user.update(
          { satisfaction: newSatisfaction, treasury: newTreasury },
          { transaction }
        );

        // Créer une transaction financière groupée si pénalité > 0
        if (financialPenalty > 0) {
          await Transaction.create(
            {
              user_id: userId,
              type: 'vip_penalty',
              amount: -financialPenalty,
              description: `Pénalité ${reallyExpired.length} commande(s) expirée(s)`,
              balance_after: newTreasury,
              created_at: new Date(),
            },
            { transaction }
          );
        }

        await transaction.commit();

        emitStats(userId, newSatisfaction, newTreasury, user.stars);

        res.status(200).json({
          success: true,
          message: `${reallyExpired.length} commande(s) expirée(s)`,
          data: {
            expiredCount: reallyExpired.length,
            satisfactionPenalty,
            financialPenalty,
            satisfaction: newSatisfaction,
            treasury: newTreasury,
            gameOver: newSatisfaction < 0 || newTreasury < 0,
          },
        });
        return;
      }
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: 'Aucune commande expirée',
      data: { expiredCount: 0, satisfactionPenalty: 0, financialPenalty: 0 },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du nettoyage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

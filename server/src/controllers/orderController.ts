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
  io.to(`user:${userId}`).emit('treasury_updated', { treasury });

  // ⭐ TICKET #020 : Événement stars_updated
  io.to(`user:${userId}`).emit('stars_updated', { stars });

  if (satisfaction < 0) {
    io.to(`user:${userId}`).emit('game_over', {
      reason: 'satisfaction',
      satisfaction,
    });
  }
  if (treasury < 0) {
    io.to(`user:${userId}`).emit('game_over', { reason: 'treasury', treasury });
  }
  // ⭐ TICKET #020 : Game Over si stars < 1
  if (stars < 1) {
    io.to(`user:${userId}`).emit('game_over', { reason: 'stars', stars });
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
      res.status(403).json({
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

      // ⭐ TICKET #020 : Perte d'étoile si commande VIP ratée
      let newStars = currentStars;
      if (order.is_vip && currentStars > 0) {
        newStars = currentStars - 1;
        console.log(
          `⭐ [VIP FAILED] userId=${userId} | stars: ${currentStars} → ${newStars}`
        );
      }

      await user.update(
        {
          satisfaction: newSatisfaction,
          treasury: newTreasury,
          stars: newStars,
        },
        { transaction }
      );

      // Créer une transaction financière de type 'penalty'
      await Transaction.create(
        {
          user_id: userId,
          type: 'vip_penalty',
          amount: -financialPenalty,
          description: `Pénalité commande expirée : ${(order as any).recipe?.name ?? 'Recette inconnue'}${order.is_vip ? ' (VIP ⭐)' : ''}`,
          balance_after: newTreasury,
          created_at: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      emitStats(userId, newSatisfaction, newTreasury, newStars);

      const isGameOver = newSatisfaction < 0 || newTreasury < 0 || newStars < 1;

      res.status(400).json({
        success: false,
        message: order.is_vip
          ? `⭐ Commande VIP expirée ! (-${satisfactionPenalty} satisfaction, -${financialPenalty.toFixed(2)}€${newStars < currentStars ? ', -1 étoile' : ''})`
          : `Commande expirée ! (-${satisfactionPenalty} satisfaction, -${financialPenalty.toFixed(2)}€)`,
        data: {
          satisfaction: newSatisfaction,
          treasury: newTreasury,
          stars: newStars,
          gameOver: isGameOver,
          gameOverReason:
            newStars < 1
              ? 'stars'
              : newSatisfaction < 0
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
      res.status(400).json({
        success: false,
        message: "Vous n'avez pas encore découvert cette recette !",
      });
      return;
    }

    // ── 4. ✅ TICKET #021 : Vérifier le stock avec FIFO ──────────────────
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

    // ✅ TICKET #021 : Vérifier le stock total par ingrédient (toutes lignes confondues)
    for (const ri of recipeIngredients) {
      const stockLines = await Inventory.findAll({
        where: { user_id: userId, ingredient_id: ri.ingredient_id },
        order: [['expiration_date', 'ASC']], // FIFO : les plus anciens en premier
        transaction,
      });

      const totalAvailable = stockLines.reduce(
        (sum, line) => sum + line.quantity,
        0
      );

      if (totalAvailable < ri.quantity) {
        insufficientIngredients.push({
          ingredient_id: ri.ingredient_id,
          required: ri.quantity,
          available: totalAvailable,
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

    // ── 5. ✅ TICKET #021 : Déduire les ingrédients du stock avec FIFO ─────
    for (const ri of recipeIngredients) {
      let remainingToConsume = ri.quantity;

      // Récupérer toutes les lignes de stock pour cet ingrédient, triées par date (FIFO)
      const stockLines = await Inventory.findAll({
        where: { user_id: userId, ingredient_id: ri.ingredient_id },
        order: [['expiration_date', 'ASC']], // FIFO : consommer les plus anciens en premier
        transaction,
      });

      for (const line of stockLines) {
        if (remainingToConsume <= 0) break;

        const consumeFromThisLine = Math.min(line.quantity, remainingToConsume);
        const newQty = line.quantity - consumeFromThisLine;

        console.log(
          `🍽️ [FIFO] userId=${userId} | ingredient=${ri.ingredient_id} | ligne=${line.id} | consommé=${consumeFromThisLine} | reste=${newQty}`
        );

        if (newQty <= 0) {
          // Supprimer la ligne si stock tombe à 0
          await Inventory.destroy({
            where: { id: line.id },
            transaction,
          });
        } else {
          // Mettre à jour la quantité restante
          await Inventory.update(
            { quantity: newQty },
            { where: { id: line.id }, transaction }
          );
        }

        remainingToConsume -= consumeFromThisLine;
      }
    }

    // ── 6. Mettre à jour la commande, satisfaction et trésorerie ──
    await order.update({ status: 'served' }, { transaction });

    // ⭐ TICKET #020 : Bonus VIP ×3 pour le gain financier
    const satisfactionBonus = order.is_vip ? 5 : 1;
    const orderPrice = parseFloat(String(order.price));
    const finalPrice = order.is_vip ? orderPrice * 3 : orderPrice; // Gain ×3 si VIP
    const newSatisfaction = currentSatisfaction + satisfactionBonus;
    const newTreasury = parseFloat((currentTreasury + finalPrice).toFixed(2));

    await user.update(
      { satisfaction: newSatisfaction, treasury: newTreasury },
      { transaction }
    );

    // ── 7. Créer une transaction financière de type 'order_revenue' ──
    await Transaction.create(
      {
        user_id: userId,
        type: 'order_revenue',
        amount: finalPrice,
        description: `Vente : ${(order as any).recipe?.name ?? 'Recette inconnue'}${order.is_vip ? ' (VIP ⭐ ×3)' : ''}`,
        balance_after: newTreasury,
        created_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    emitStats(userId, newSatisfaction, newTreasury, currentStars);

    const isGameOver =
      newSatisfaction < 0 || newTreasury < 0 || currentStars < 1;

    res.status(200).json({
      success: true,
      message: order.is_vip
        ? `⭐ Commande VIP servie ! (+${satisfactionBonus} satisfaction, +${finalPrice.toFixed(2)}€ [×3 bonus])`
        : `Commande servie ! (+${satisfactionBonus} satisfaction, +${orderPrice.toFixed(2)}€)`,
      data: {
        orderId: order.id,
        satisfaction: newSatisfaction,
        treasury: newTreasury,
        stars: currentStars,
        recipeName: (order as any).recipe?.name ?? 'Recette inconnue',
        isVip: order.is_vip,
        satisfactionBonus,
        finalPrice,
        gameOver: isGameOver,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du service de la commande:', error);
    res.status(500).json({
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

      // ⭐ TICKET #020 : Compter les étoiles perdues (1 par VIP ratée)
      const vipFailedCount = reallyExpired.filter((o) => o.is_vip).length;

      const user = await User.findOne({ where: { id: userId }, transaction });

      if (user) {
        const newSatisfaction = user.satisfaction - satisfactionPenalty;
        const newTreasury = parseFloat(
          (parseFloat(String(user.treasury)) - financialPenalty).toFixed(2)
        );
        const newStars = Math.max(0, user.stars - vipFailedCount);

        await user.update(
          {
            satisfaction: newSatisfaction,
            treasury: newTreasury,
            stars: newStars,
          },
          { transaction }
        );

        // Créer une transaction financière groupée si pénalité > 0
        if (financialPenalty > 0) {
          await Transaction.create(
            {
              user_id: userId,
              type: 'vip_penalty',
              amount: -financialPenalty,
              description: `Pénalité ${reallyExpired.length} commande(s) expirée(s)${vipFailedCount > 0 ? ` (dont ${vipFailedCount} VIP)` : ''}`,
              balance_after: newTreasury,
              created_at: new Date(),
            },
            { transaction }
          );
        }

        await transaction.commit();

        emitStats(userId, newSatisfaction, newTreasury, newStars);

        res.status(200).json({
          success: true,
          message: `${reallyExpired.length} commande(s) expirée(s)`,
          data: {
            expiredCount: reallyExpired.length,
            satisfactionPenalty,
            financialPenalty,
            starsLost: user.stars - newStars,
            satisfaction: newSatisfaction,
            treasury: newTreasury,
            stars: newStars,
            gameOver: newSatisfaction < 0 || newTreasury < 0 || newStars < 1,
          },
        });
        return;
      }
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: 'Aucune commande expirée',
      data: {
        expiredCount: 0,
        satisfactionPenalty: 0,
        financialPenalty: 0,
        starsLost: 0,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du nettoyage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Order, User, Recipe, UserDiscoveredRecipe } from '../models';
import sequelize from '../config/db';
import { io } from '../app';

/**
 * 🍽️ SERVIR UNE COMMANDE
 * Endpoint: POST /api/orders/serve/:orderId
 */
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
      res.status(400).json({ success: false, message: 'ID de commande invalide' });
      return;
    }

    if (!userId) {
      await transaction.rollback();
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    const order = await Order.findOne({
      where: { id: orderIdNum },
      include: [{ model: Recipe, as: 'recipe', attributes: ['id', 'name', 'sale_price'] }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      res.status(404).json({ success: false, message: 'Commande introuvable' });
      return;
    }

    if (order.user_id !== userId) {
      await transaction.rollback();
      res.status(403).json({ success: false, message: 'Cette commande ne vous appartient pas' });
      return;
    }

    if (order.status === 'served') {
      await transaction.rollback();
      res.status(400).json({ success: false, message: 'Cette commande a déjà été servie' });
      return;
    }

    const user = await User.findOne({ where: { id: userId }, transaction });
    if (!user) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    const now = new Date();
    const isExpired = new Date(order.expires_at) < now;

    if (isExpired) {
      await order.update({ status: 'expired' }, { transaction });

      const penalty = order.is_vip ? 20 : 10;
      const newSatisfaction = user.satisfaction - penalty;

      await user.update({ satisfaction: newSatisfaction }, { transaction });
      await transaction.commit();

      io.to(`user:${userId}`).emit('stats_update', {
        satisfaction: newSatisfaction,
        treasury: parseFloat(String(user.treasury)),
      });

      if (newSatisfaction < 0) {
        io.to(`user:${userId}`).emit('game_over', {
          reason: 'satisfaction',
          satisfaction: newSatisfaction,
        });
      }

      res.status(400).json({
        success: false,
        message: `Cette commande a expiré ! (-${penalty} satisfaction)`,
        data: { satisfaction: newSatisfaction, gameOver: newSatisfaction < 0 },
      });
      return;
    }

    const discoveredRecipe = await UserDiscoveredRecipe.findOne({
      where: { user_id: userId, recipe_id: order.recipe_id },
      transaction,
    });

    if (!discoveredRecipe) {
      await transaction.rollback();
      res.status(400).json({ success: false, message: "Vous n'avez pas encore découvert cette recette !" });
      return;
    }

    await order.update({ status: 'served' }, { transaction });

    const satisfactionBonus = order.is_vip ? 5 : 1;
    const newSatisfaction = user.satisfaction + satisfactionBonus;
    const orderPrice = parseFloat(String(order.price));
    const newTreasury = parseFloat(String(user.treasury)) + orderPrice;

    await user.update(
      { satisfaction: newSatisfaction, treasury: newTreasury },
      { transaction }
    );

    await transaction.commit();

    io.to(`user:${userId}`).emit('stats_update', {
      satisfaction: newSatisfaction,
      treasury: newTreasury,
    });

    if (newSatisfaction < 0) {
      io.to(`user:${userId}`).emit('game_over', {
        reason: 'satisfaction',
        satisfaction: newSatisfaction,
      });
    }

    res.status(200).json({
      success: true,
      message: order.is_vip
        ? `⭐ Commande VIP servie avec succès ! (+${satisfactionBonus} satisfaction, +${orderPrice}€)`
        : `Commande servie avec succès ! (+${satisfactionBonus} satisfaction, +${orderPrice}€)`,
      data: {
        orderId: order.id,
        satisfaction: newSatisfaction,
        treasury: newTreasury,
        recipeName: (order as any).recipe?.name || 'Recette inconnue',
        isVip: order.is_vip,
        satisfactionBonus,
        gameOver: false,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du service de la commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors du service de la commande' });
  }
};

/**
 * 📋 RÉCUPÉRER TOUTES LES COMMANDES DE L'UTILISATEUR
 * Endpoint: GET /api/orders
 */
export const getOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
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

/**
 * 🗑️ NETTOYER LES COMMANDES EXPIRÉES (CRON JOB)
 * Endpoint: POST /api/orders/cleanup-expired
 */
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

      const penalty = reallyExpired.reduce((total, order) => {
        return total + (order.is_vip ? 20 : 10);
      }, 0);

      const user = await User.findOne({ where: { id: userId }, transaction });

      if (user) {
        const newSatisfaction = user.satisfaction - penalty;
        await user.update({ satisfaction: newSatisfaction }, { transaction });
        await transaction.commit();

        // ✅ room avec deux-points (cohérent avec tout le reste)
        io.to(`user:${userId}`).emit('stats_update', {
          satisfaction: newSatisfaction,
        });

        if (newSatisfaction < 0) {
          io.to(`user:${userId}`).emit('game_over', {
            reason: 'satisfaction',
            satisfaction: newSatisfaction,
          });
        }

        res.status(200).json({
          success: true,
          message: `${reallyExpired.length} commande(s) expirée(s)`,
          data: {
            expiredCount: reallyExpired.length,
            penalty,
            satisfaction: newSatisfaction,
            gameOver: newSatisfaction < 0,
          },
        });
        return;
      }
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: 'Aucune commande expirée',
      data: { expiredCount: 0, penalty: 0 },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du nettoyage des commandes expirées:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

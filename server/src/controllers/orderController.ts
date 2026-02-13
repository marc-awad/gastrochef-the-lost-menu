import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Order, User, Recipe, UserDiscoveredRecipe } from '../models';
import sequelize from '../config/db';

/**
 * 🍽️ SERVIR UNE COMMANDE
 *
 * Endpoint: POST /api/orders/serve/:orderId
 *
 * Vérifications:
 * 1. Commande existe
 * 2. Commande appartient à l'utilisateur
 * 3. Commande n'est pas déjà servie
 * 4. Commande n'est pas expirée
 * 5. Recette est découverte par le joueur
 *
 * Actions (transaction atomique):
 * - Order.status = 'served'
 * - User.satisfaction += 1 (ou +5 si VIP)
 *
 * Game Over si satisfaction < 0
 */
export const serveOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // ✅ CORRECTION : Gérer le cas où orderId pourrait être un tableau
    const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;
    const orderIdNum = parseInt(orderIdStr, 10);

    // Vérifier que c'est un nombre valide
    if (isNaN(orderIdNum)) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'ID de commande invalide',
      });
      return;
    }

    // Vérification: utilisateur authentifié
    if (!userId) {
      await transaction.rollback();
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
      return;
    }

    // 1. Récupérer la commande avec la recette associée
    const order = await Order.findByPk(orderIdNum, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'sale_price'],
        },
      ],
      transaction,
    });

    // Vérification: commande existe
    if (!order) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
      return;
    }

    // 2. Vérification: commande appartient à l'utilisateur
    if (order.user_id !== userId) {
      await transaction.rollback();
      res.status(403).json({
        success: false,
        message: 'Cette commande ne vous appartient pas',
      });
      return;
    }

    // 3. Vérification: commande n'est pas déjà servie
    if (order.status === 'served') {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Cette commande a déjà été servie',
      });
      return;
    }

    // 4. Vérification: commande n'est pas expirée
    const now = new Date();
    const isExpired = new Date(order.expires_at) < now;

    if (isExpired) {
      // Marquer comme expirée et pénaliser
      await order.update({ status: 'expired' }, { transaction });

      const user = await User.findByPk(userId, { transaction });

      if (user) {
        const penalty = order.is_vip ? 20 : 10; // VIP pénalise plus
        const newSatisfaction = user.satisfaction - penalty;

        await user.update({ satisfaction: newSatisfaction }, { transaction });
        await transaction.commit();

        res.status(400).json({
          success: false,
          message: `Cette commande a expiré ! (-${penalty} satisfaction)`,
          data: {
            satisfaction: newSatisfaction,
            gameOver: newSatisfaction < 0,
          },
        });
        return;
      }
    }

    // 5. Vérification: recette découverte par le joueur
    const discoveredRecipe = await UserDiscoveredRecipe.findOne({
      where: {
        user_id: userId,
        recipe_id: order.recipe_id,
      },
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

    // 6. TRANSACTION ATOMIQUE: Servir la commande

    // a) Mise à jour du statut de la commande
    await order.update({ status: 'served' }, { transaction });

    // b) Récupération de l'utilisateur
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      res.status(500).json({
        success: false,
        message: 'Erreur : utilisateur introuvable',
      });
      return;
    }

    // c) Calcul du bonus de satisfaction (VIP = +5, normal = +1)
    const satisfactionBonus = order.is_vip ? 5 : 1;
    const newSatisfaction = user.satisfaction + satisfactionBonus;

    // d) Mise à jour de la satisfaction
    await user.update({ satisfaction: newSatisfaction }, { transaction });

    // e) COMMIT de la transaction
    await transaction.commit();

    // ✅ NOUVEAU : Vérification Game Over après service réussi
    if (newSatisfaction < 0) {
      res.status(200).json({
        success: true,
        message: 'Commande servie, mais votre satisfaction est critique !',
        data: {
          orderId: order.id,
          satisfaction: newSatisfaction,
          recipeName: (order as any).recipe?.name || 'Recette inconnue',
          isVip: order.is_vip,
          satisfactionBonus,
          gameOver: true, // ⚠️ Game Over déclenché
        },
      });
      return;
    }

    // 7. Réponse succès (satisfaction >= 0)
    res.status(200).json({
      success: true,
      message: order.is_vip
        ? `⭐ Commande VIP servie avec succès ! (+${satisfactionBonus} satisfaction)`
        : `Commande servie avec succès ! (+${satisfactionBonus} satisfaction)`,
      data: {
        orderId: order.id,
        satisfaction: newSatisfaction,
        recipeName: (order as any).recipe?.name || 'Recette inconnue',
        isVip: order.is_vip,
        satisfactionBonus,
        gameOver: false,
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

/**
 * 📋 RÉCUPÉRER TOUTES LES COMMANDES DE L'UTILISATEUR
 *
 * Endpoint: GET /api/orders
 *
 * Retourne uniquement les commandes 'pending' (en attente)
 */
export const getOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
      return;
    }

    const orders = await Order.findAll({
      where: {
        user_id: userId,
        status: 'pending',
      },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'description', 'sale_price'],
        },
      ],
      order: [['expires_at', 'ASC']], // Les plus urgentes en premier
    });

    // Formater les données pour le frontend
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

    res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

/**
 * 🗑️ NETTOYER LES COMMANDES EXPIRÉES (CRON JOB)
 *
 * Endpoint: POST /api/orders/cleanup-expired
 *
 * Marque toutes les commandes expirées comme 'expired'
 * et applique la pénalité de satisfaction
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
      res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
      return;
    }

    const now = new Date();

    // Trouver toutes les commandes expirées non traitées
    const expiredOrders = await Order.findAll({
      where: {
        user_id: userId,
        status: 'pending',
      },
      transaction,
    });

    // Filtrer celles qui sont vraiment expirées
    const reallyExpired = expiredOrders.filter(
      (order) => new Date(order.expires_at) < now
    );

    if (reallyExpired.length > 0) {
      // Marquer comme expirées
      const expiredIds = reallyExpired.map((o) => o.id);

      await Order.update(
        { status: 'expired' },
        {
          where: { id: expiredIds },
          transaction,
        }
      );

      // Calculer la pénalité totale
      const penalty = reallyExpired.reduce((total, order) => {
        return total + (order.is_vip ? 20 : 10);
      }, 0);

      // Appliquer la pénalité
      const user = await User.findByPk(userId, { transaction });

      if (user) {
        const newSatisfaction = user.satisfaction - penalty;
        await user.update({ satisfaction: newSatisfaction }, { transaction });

        await transaction.commit();

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
      data: {
        expiredCount: 0,
        penalty: 0,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du nettoyage des commandes expirées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

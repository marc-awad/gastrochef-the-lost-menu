import { Order, User } from '../models';
import sequelize from '../config/db';
import { io } from '../app';

/**
 * 🕐 VÉRIFICATEUR AUTOMATIQUE DES COMMANDES EXPIRÉES
 *
 * Vérifie toutes les 5 secondes si des commandes sont expirées
 * et applique automatiquement les pénalités.
 *
 * ⚠️ Ignore les commandes expirées depuis plus de 1 minute (pour éviter les bugs au démarrage)
 */

let lastCheckTime = Date.now();

export const startOrderExpirationChecker = () => {
  console.log('⏰ Démarrage du vérificateur de commandes expirées');

  setInterval(async () => {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      // ✅ CORRECTION : Ne traiter QUE les commandes expirées RÉCEMMENT (< 1 minute)
      // Cela évite de pénaliser pour de vieilles commandes lors du redémarrage du serveur
      const expiredOrders = await Order.findAll({
        where: {
          status: 'pending',
        },
      });

      // Filtrer : expirées depuis moins de 1 minute
      const recentlyExpired = expiredOrders.filter((order) => {
        const expiresAt = new Date(order.expires_at);
        return expiresAt < now && expiresAt >= oneMinuteAgo;
      });

      if (recentlyExpired.length > 0) {
        console.log(
          `⏰ ${recentlyExpired.length} commande(s) récemment expirée(s) détectée(s)`
        );

        // Traiter chaque commande expirée
        for (const order of recentlyExpired) {
          const transaction = await sequelize.transaction();

          try {
            // Marquer comme expirée
            await order.update({ status: 'expired' }, { transaction });

            // Récupérer l'utilisateur
            const user = await User.findByPk(order.user_id, { transaction });

            if (user) {
              // Calculer la pénalité
              const penalty = order.is_vip ? 20 : 10;
              const newSatisfaction = user.satisfaction - penalty;

              // Mettre à jour la satisfaction
              await user.update(
                { satisfaction: newSatisfaction },
                { transaction }
              );

              await transaction.commit();

              console.log(
                `❌ Commande #${order.id} expirée (User ${order.user_id}) - Satisfaction: ${user.satisfaction} → ${newSatisfaction}`
              );

              // Émettre les événements WebSocket
              io.to(`user_${order.user_id}`).emit('order_expired', {
                orderId: order.id,
                satisfaction: newSatisfaction,
                penalty,
              });

              io.to(`user_${order.user_id}`).emit('stats_update', {
                satisfaction: newSatisfaction,
              });

              // ✅ Émettre game_over si satisfaction < 0
              if (newSatisfaction < 0) {
                console.log(`💀 GAME OVER pour User ${order.user_id}`);
                io.to(`user_${order.user_id}`).emit('game_over', {
                  reason: 'satisfaction',
                  satisfaction: newSatisfaction,
                });
              }
            }
          } catch (error) {
            await transaction.rollback();
            console.error(
              `❌ Erreur lors du traitement de la commande #${order.id}:`,
              error
            );
          }
        }
      }

      // ✅ NOUVEAU : Nettoyer les très vieilles commandes (> 5 minutes) sans pénalité
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const veryOldOrders = expiredOrders.filter((order) => {
        const expiresAt = new Date(order.expires_at);
        return expiresAt < fiveMinutesAgo;
      });

      if (veryOldOrders.length > 0) {
        const oldOrderIds = veryOldOrders.map((o) => o.id);
        await Order.update(
          { status: 'expired' },
          { where: { id: oldOrderIds } }
        );
        console.log(
          `🧹 ${veryOldOrders.length} vieille(s) commande(s) nettoyée(s) (sans pénalité)`
        );
      }

      lastCheckTime = Date.now();
    } catch (error) {
      console.error(
        '❌ Erreur dans le vérificateur de commandes expirées:',
        error
      );
    }
  }, 5000); // Vérifie toutes les 5 secondes
};

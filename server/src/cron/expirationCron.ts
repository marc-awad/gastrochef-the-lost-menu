import { Inventory, Ingredient } from '../models';
import { Op } from 'sequelize';

export const cleanupExpiredIngredients = async (): Promise<void> => {
  try {
    const now = new Date();

    console.log(
      `🧹 [CRON] Démarrage nettoyage ingrédients périmés (${now.toISOString()})`
    );

    // Récupérer d'abord les lignes périmées pour logger
    const expiredLines = await Inventory.findAll({
      where: {
        expiration_date: {
          [Op.lt]: now,
        },
      },
      include: [
        {
          model: Ingredient,
          as: 'ingredient',
          attributes: ['name'],
        },
      ],
    });

    if (expiredLines.length === 0) {
      console.log('✅ [CRON] Aucun ingrédient périmé trouvé');
      return;
    }

    // Logger les suppressions
    console.log(
      `🗑️ [CRON] ${expiredLines.length} ligne(s) d'ingrédients périmés trouvée(s):`
    );
    expiredLines.forEach((line: any) => {
      const ingredientName = line.ingredient?.name || 'Inconnu';
      const qty = line.quantity;
      const userId = line.user_id;
      const expirationDate = new Date(line.expiration_date);

      console.log(
        `   → userId=${userId} | ${ingredientName} x${qty} | périmé le ${expirationDate.toLocaleDateString('fr-FR')}`
      );
    });

    // Supprimer toutes les lignes périmées
    const deletedCount = await Inventory.destroy({
      where: {
        expiration_date: {
          [Op.lt]: now,
        },
      },
    });

    console.log(
      `✅ [CRON] ${deletedCount} ligne(s) supprimée(s) de l'inventaire`
    );
  } catch (error) {
    console.error('❌ [CRON] Erreur lors du nettoyage des périmés:', error);
  }
};

// ============================================================
//  Initialisation du Cron Job
// ============================================================
export const initExpirationCron = (): NodeJS.Timeout => {
  console.log('⏰ [CRON] Initialisation du nettoyage des ingrédients périmés');
  console.log('⏰ [CRON] Fréquence : toutes les heures');

  // Lancer immédiatement au démarrage
  cleanupExpiredIngredients();

  // Puis toutes les heures (3600000 ms)
  const interval = setInterval(() => {
    cleanupExpiredIngredients();
  }, 3600000); // 1 heure = 60 * 60 * 1000 ms

  return interval;
};

// ============================================================
//  Helper : Obtenir les ingrédients proches de l'expiration
//  Pour les notifications (<24h)
// ============================================================
export const getExpiringIngredients = async (
  userId: number
): Promise<
  Array<{
    id: number;
    ingredient_name: string;
    quantity: number;
    expiration_date: Date;
    hours_until_expiration: number;
  }>
> => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringLines = await Inventory.findAll({
      where: {
        user_id: userId,
        expiration_date: {
          [Op.between]: [now, in24Hours],
        },
      },
      include: [
        {
          model: Ingredient,
          as: 'ingredient',
          attributes: ['name'],
        },
      ],
      order: [['expiration_date', 'ASC']],
    });

    return expiringLines.map((line: any) => {
      const expirationDate = new Date(line.expiration_date);
      const hoursUntilExpiration = Math.max(
        0,
        Math.floor(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        )
      );

      return {
        id: line.id,
        ingredient_name: line.ingredient?.name || 'Inconnu',
        quantity: line.quantity,
        expiration_date: expirationDate,
        hours_until_expiration: hoursUntilExpiration,
      };
    });
  } catch (error) {
    console.error('❌ [getExpiringIngredients]', error);
    return [];
  }
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User, Order } from '../models';
import sequelize from '../config/db';

/**
 * 🔄 RESET DE PARTIE
 * Remet satisfaction, treasury, stars à leurs valeurs initiales
 * et nettoie toutes les commandes pending/expired de l'utilisateur
 */
export const resetGame = async (
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

    // 1. Nettoyer TOUTES les commandes (pending ET expired) de l'utilisateur
    await Order.destroy({
      where: { user_id: userId },
      transaction,
    });

    // 2. Remettre les stats à leurs valeurs initiales
    await User.update(
      {
        satisfaction: 20,
        treasury: 1000,
        stars: 3,
      },
      {
        where: { id: userId },
        transaction,
      }
    );

    await transaction.commit();

    console.log(`🔄 [RESET] userId=${userId} — partie réinitialisée`);

    res.status(200).json({
      success: true,
      message: 'Partie réinitialisée',
      data: { satisfaction: 20, treasury: 1000, stars: 3 },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ [RESET] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

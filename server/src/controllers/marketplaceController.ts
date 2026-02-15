import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import sequelize from '../config/db';
import { User, Ingredient, Inventory, Transaction } from '../models';

// ============================================================
//  GET /api/inventory
//  Retourne le stock actuel de l'utilisateur connecté
//  ✅ TICKET #021 : Agrégation par ingrédient + info expiration
// ============================================================
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // ✅ TICKET #021 : Récupérer TOUTES les lignes (FIFO)
    const inventoryLines = await Inventory.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Ingredient,
          as: 'ingredient',
          attributes: ['id', 'name', 'price'],
        },
      ],
      order: [
        ['ingredient_id', 'ASC'],
        ['expiration_date', 'ASC'], // FIFO : les plus anciens en premier
      ],
    });

    // ✅ Agrégation par ingrédient avec infos d'expiration
    const aggregated: Record<
      number,
      {
        ingredient_id: number;
        ingredient_name: string;
        ingredient_price: number;
        total_quantity: number;
        lines: Array<{
          id: number;
          quantity: number;
          purchased_at: Date;
          expiration_date: Date;
          days_until_expiration: number;
          status: 'fresh' | 'warning' | 'critical' | 'expired';
        }>;
      }
    > = {};

    const now = new Date();

    inventoryLines.forEach((line: any) => {
      const ingredientId = line.ingredient_id;
      const expirationDate = new Date(line.expiration_date);
      const msUntilExpiration = expirationDate.getTime() - now.getTime();
      const daysUntilExpiration = Math.ceil(
        msUntilExpiration / (1000 * 60 * 60 * 24)
      );

      let status: 'fresh' | 'warning' | 'critical' | 'expired' = 'fresh';
      if (daysUntilExpiration < 0) status = 'expired';
      else if (daysUntilExpiration < 1) status = 'critical';
      else if (daysUntilExpiration <= 3) status = 'warning';

      if (!aggregated[ingredientId]) {
        aggregated[ingredientId] = {
          ingredient_id: ingredientId,
          ingredient_name: line.ingredient?.name || 'Inconnu',
          ingredient_price: parseFloat(line.ingredient?.price || 0),
          total_quantity: 0,
          lines: [],
        };
      }

      aggregated[ingredientId].total_quantity += line.quantity;
      aggregated[ingredientId].lines.push({
        id: line.id,
        quantity: line.quantity,
        purchased_at: line.purchased_at,
        expiration_date: line.expiration_date,
        days_until_expiration: daysUntilExpiration,
        status,
      });
    });

    return res.status(200).json({
      success: true,
      data: Object.values(aggregated),
    });
  } catch (error) {
    console.error('❌ [getInventory]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ============================================================
//  POST /api/marketplace/buy
//  Body : { ingredientId: number, quantity: number }
//
//  ✅ TICKET #021 : Calcul expiration_date (achat + 7 jours)
//  ✅ Création d'une NOUVELLE ligne à chaque achat (FIFO)
// ============================================================
export const buyIngredient = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { ingredientId, quantity } = req.body;

  // ── Validation des inputs ──────────────────────────────────
  if (!ingredientId || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'ingredientId et quantity sont requis',
    });
  }

  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'La quantité doit être un entier positif',
    });
  }

  if (parsedQuantity > 99) {
    return res.status(400).json({
      success: false,
      message: 'Quantité maximale par achat : 99',
    });
  }

  const t = await sequelize.transaction();

  try {
    // ── 1. Récupérer l'ingrédient ────────────────────────────
    const ingredient = await Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Ingrédient introuvable' });
    }

    // ── 2. Calculer le coût total ────────────────────────────
    const totalCost = parseFloat(ingredient.price as any) * parsedQuantity;

    // ── 3. Récupérer l'utilisateur et vérifier les fonds ────
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Utilisateur introuvable' });
    }

    const currentTreasury = parseFloat(user.treasury as any);
    if (currentTreasury < totalCost) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Fonds insuffisants. Coût : ${totalCost.toFixed(2)}€, Trésorerie : ${currentTreasury.toFixed(2)}€`,
      });
    }

    const newTreasury = parseFloat((currentTreasury - totalCost).toFixed(2));

    // ── 4a. Débiter la trésorerie ────────────────────────────
    await User.update(
      { treasury: newTreasury },
      { where: { id: userId }, transaction: t }
    );

    // ── 4b. ✅ TICKET #021 : Créer une NOUVELLE ligne avec expiration ──
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours

    await Inventory.create(
      {
        user_id: userId,
        ingredient_id: ingredientId,
        quantity: parsedQuantity,
        purchased_at: now,
        expiration_date: expirationDate,
      },
      { transaction: t }
    );

    console.log(
      `📦 [BUY] userId=${userId} | x${parsedQuantity} ${ingredient.name} | expire le ${expirationDate.toISOString()}`
    );

    // ── 4c. Créer la transaction financière ──────────────────
    await Transaction.create(
      {
        user_id: userId,
        type: 'ingredient_purchase',
        amount: -totalCost,
        description: `Achat x${parsedQuantity} ${ingredient.name}`,
        balance_after: newTreasury,
        created_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `✅ Achat effectué : x${parsedQuantity} ${ingredient.name} (expire le ${expirationDate.toLocaleDateString('fr-FR')})`,
      data: {
        ingredientName: ingredient.name,
        quantity: parsedQuantity,
        totalCost,
        newTreasury,
        expirationDate,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ [buyIngredient]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

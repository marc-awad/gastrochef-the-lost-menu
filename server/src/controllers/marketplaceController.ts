import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import sequelize from '../config/db';
import { User, Ingredient, Inventory, Transaction } from '../models';

// ============================================================
//  GET /api/inventory
//  Retourne le stock actuel de l'utilisateur connecté
// ============================================================
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const inventory = await Inventory.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Ingredient,
          as: 'ingredient',
          attributes: ['id', 'name', 'price'],
        },
      ],
      order: [[{ model: Ingredient, as: 'ingredient' }, 'name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: inventory,
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
//  Logique :
//  1. Vérifier que l'ingrédient existe
//  2. Calculer le coût total
//  3. Vérifier que l'utilisateur a les fonds
//  4. Transaction atomique :
//     a. Débiter la trésorerie
//     b. Upsert inventory (INSERT ou UPDATE quantity)
//     c. Créer une entrée Transaction
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

    // ── 4b. Upsert inventory ─────────────────────────────────
    // On cherche d'abord une ligne existante pour cet user + ingrédient
    const existingStock = await Inventory.findOne({
      where: { user_id: userId, ingredient_id: ingredientId },
      transaction: t,
    });

    if (existingStock) {
      await Inventory.update(
        { quantity: existingStock.quantity + parsedQuantity },
        {
          where: { user_id: userId, ingredient_id: ingredientId },
          transaction: t,
        }
      );
    } else {
      await Inventory.create(
        {
          user_id: userId,
          ingredient_id: ingredientId,
          quantity: parsedQuantity,
          purchased_at: new Date(),
        },
        { transaction: t }
      );
    }

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
      message: `✅ Achat effectué : x${parsedQuantity} ${ingredient.name}`,
      data: {
        ingredientName: ingredient.name,
        quantity: parsedQuantity,
        totalCost,
        newTreasury,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ [buyIngredient]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

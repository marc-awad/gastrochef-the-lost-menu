import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Transaction, Recipe, Ingredient, RecipeIngredient } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/db';

// ─────────────────────────────────────────────────────────────
//  GET /api/transactions
//  Query params :
//    - page    (défaut: 1)
//    - limit   (défaut: 20, max: 100)
//    - type    (optionnel: filtre sur le type)
// ─────────────────────────────────────────────────────────────
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20)
    );
    const type = req.query.type as string | undefined;
    const offset = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (type && type !== 'all') {
      where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const data = rows.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(String(t.amount)),
      description: t.description,
      balance_after: parseFloat(String(t.balance_after)),
      created_at: t.created_at,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('❌ [getTransactions]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/dashboard/stats
//  Renvoie :
//    - résumé financier (total revenus, dépenses, solde net)
//    - évolution trésorerie (50 derniers points)
//    - répartition par type (pour pie chart)
//    - rentabilité par recette (top 20)
// ─────────────────────────────────────────────────────────────
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // ── Toutes les transactions de l'utilisateur ──────────────
    const allTransactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'ASC']],
    });

    // ── Résumé financier ──────────────────────────────────────
    let totalRevenue = 0;
    let totalExpenses = 0;
    const typeBreakdown: Record<string, number> = {};

    allTransactions.forEach((t) => {
      const amount = parseFloat(String(t.amount));
      if (amount > 0) totalRevenue += amount;
      else totalExpenses += Math.abs(amount);

      typeBreakdown[t.type] = (typeBreakdown[t.type] ?? 0) + Math.abs(amount);
    });

    // ── Évolution trésorerie (50 derniers points) ────────────
    const last50 = allTransactions.slice(-50);
    const treasuryHistory = last50.map((t) => ({
      date: new Date(t.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      balance: parseFloat(String(t.balance_after)),
      type: t.type,
    }));

    // ── Répartition par type pour pie chart ──────────────────
    const pieData = Object.entries(typeBreakdown).map(([type, total]) => ({
      name: TYPE_LABELS[type] ?? type,
      value: parseFloat(total.toFixed(2)),
      type,
    }));

    // ── Rentabilité par recette ───────────────────────────────
    const recipes = await Recipe.findAll({
      include: [
        {
          model: Ingredient,
          as: 'Ingredients',
          attributes: ['id', 'name', 'price'],
          through: { attributes: ['quantity'] },
        },
      ],
    });

    const profitabilityData = recipes.map((recipe) => {
      const salePrice = parseFloat(String(recipe.sale_price));
      const ingredients = (recipe as any).Ingredients ?? [];

      const ingredientCost = ingredients.reduce((sum: number, ing: any) => {
        const price = parseFloat(String(ing.price));
        const qty =
          ing.RecipeIngredient?.quantity ??
          ing.recipe_ingredients?.quantity ??
          1;
        return sum + price * qty;
      }, 0);

      const margin = salePrice - ingredientCost;
      const marginPct = salePrice > 0 ? (margin / salePrice) * 100 : 0;

      return {
        id: recipe.id,
        name: recipe.name,
        salePrice: parseFloat(salePrice.toFixed(2)),
        ingredientCost: parseFloat(ingredientCost.toFixed(2)),
        margin: parseFloat(margin.toFixed(2)),
        marginPct: parseFloat(marginPct.toFixed(1)),
      };
    });

    // Tri par marge décroissante, top 20
    profitabilityData.sort((a, b) => b.marginPct - a.marginPct);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netBalance: parseFloat((totalRevenue - totalExpenses).toFixed(2)),
          transactionCount: allTransactions.length,
        },
        treasuryHistory,
        pieData,
        profitability: profitabilityData.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('❌ [getDashboardStats]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Labels lisibles pour les types de transaction
const TYPE_LABELS: Record<string, string> = {
  order_revenue: 'Ventes',
  ingredient_purchase: 'Achats ingrédients',
  vip_bonus: 'Bonus VIP',
  vip_penalty: 'Pénalités',
  initial_treasury: 'Trésorerie initiale',
};

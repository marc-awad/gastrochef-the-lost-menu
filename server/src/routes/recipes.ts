import { Router, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Ingredient } from '../models/Ingredient';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/recipes — toutes les recettes (public)
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    console.error('Erreur recipes:', error);
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des recettes' });
  }
});

// GET /api/user/recipes — recettes découvertes par le joueur connecté
router.get(
  '/user/recipes',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      const discovered = await UserDiscoveredRecipe.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Recipe,
            as: 'recipe',
            include: [
              {
                model: Ingredient,
                as: 'Ingredients',
                through: { attributes: ['quantity'] },
              },
            ],
          },
        ],
        order: [['discovered_at', 'DESC']],
      });

      const recipes = discovered.map((entry: any) => {
        const recipe = entry.recipe;
        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description ?? null,
          sale_price: recipe.sale_price,
          discovered_at: entry.discovered_at,
          ingredients:
            recipe.Ingredients?.map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              quantity: ing.RecipeIngredient?.quantity ?? 1,
            })) ?? [],
        };
      });

      res.json({
        success: true,
        count: recipes.length,
        recipes,
      });
    } catch (error) {
      console.error('Erreur user/recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des recettes découvertes',
      });
    }
  }
);

export default router;

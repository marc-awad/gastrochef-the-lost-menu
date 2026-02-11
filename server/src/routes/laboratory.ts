import { Router, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Ingredient } from '../models/Ingredient';
import { RecipeIngredient } from '../models/RecipeIngredient';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/laboratory/experiment
router.post(
  '/experiment',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { ingredientIds } = req.body;
      const userId = req.userId;

      // Validation
      if (
        !ingredientIds ||
        !Array.isArray(ingredientIds) ||
        ingredientIds.length < 2
      ) {
        return res.status(400).json({
          message: 'Vous devez sélectionner au moins 2 ingrédients',
        });
      }

      // Chercher une recette correspondante
      const matchingRecipe = await findMatchingRecipe(ingredientIds);

      if (!matchingRecipe) {
        return res.status(404).json({
          success: false,
          message: '❌ Aucune recette trouvée avec cette combinaison',
          discovered: false,
        });
      }

      // Vérifier si déjà découverte
      const alreadyDiscovered = await UserDiscoveredRecipe.findOne({
        where: {
          user_id: userId,
          recipe_id: matchingRecipe.id,
        },
      });

      if (alreadyDiscovered) {
        return res.json({
          success: true,
          message: '🔄 Vous avez déjà découvert cette recette',
          recipe: matchingRecipe,
          discovered: false,
          alreadyKnown: true,
        });
      }

      // Nouvelle découverte !
      await UserDiscoveredRecipe.create({
        user_id: userId!,
        recipe_id: matchingRecipe.id,
      });

      return res.json({
        success: true,
        message: '🎉 Nouvelle recette découverte !',
        recipe: matchingRecipe,
        discovered: true,
        alreadyKnown: false,
      });
    } catch (error) {
      console.error('Erreur expérimentation:', error);
      return res.status(500).json({
        message: "Erreur serveur lors de l'expérimentation",
      });
    }
  }
);

// Fonction helper pour trouver une recette correspondante
async function findMatchingRecipe(ingredientIds: number[]) {
  // Récupérer toutes les recettes avec leurs ingrédients
  const recipes = await Recipe.findAll({
    include: [
      {
        model: Ingredient,
        through: { attributes: ['quantity'] },
      },
    ],
  });

  // Chercher une recette qui matche exactement les ingrédients
  for (const recipe of recipes) {
    const recipeIngredients = (recipe as any).Ingredients || [];
    const recipeIngredientIds = recipeIngredients.map((i: any) => i.id);

    // Vérifier si les IDs correspondent (ordre n'importe pas)
    const sortedRecipeIds = [...recipeIngredientIds].sort();
    const sortedSelectedIds = [...ingredientIds].sort();

    if (JSON.stringify(sortedRecipeIds) === JSON.stringify(sortedSelectedIds)) {
      return recipe;
    }
  }

  return null;
}

export default router;

import { Router, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Ingredient } from '../models/Ingredient';
import { RecipeIngredient } from '../models/RecipeIngredient';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

const router = Router();

// POST /api/laboratory/experiment
router.post(
  '/experiment',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    console.log('\n🧪 ========== DÉBUT EXPÉRIMENTATION ==========');

    try {
      const { ingredientIds } = req.body;
      const userId = req.userId;

      console.log('📥 Données reçues:', {
        userId,
        ingredientIds,
        typeOfIngredientIds: Array.isArray(ingredientIds)
          ? 'array'
          : typeof ingredientIds,
      });

      // Validation
      if (
        !ingredientIds ||
        !Array.isArray(ingredientIds) ||
        ingredientIds.length < 2
      ) {
        console.log('❌ Validation échouée');
        return res.status(400).json({
          success: false,
          message: 'Vous devez sélectionner au moins 2 ingrédients',
        });
      }

      console.log('✅ Validation OK - Recherche de recette...');

      // Chercher une recette correspondante
      const matchingRecipe = await findMatchingRecipe(ingredientIds);

      console.log(
        '📊 Résultat recherche:',
        matchingRecipe
          ? `Recette trouvée: ${matchingRecipe.name}`
          : 'Aucune recette'
      );

      if (!matchingRecipe) {
        console.log('❌ Aucune recette trouvée - Fin\n');
        return res.status(200).json({
          success: false,
          message:
            '❌ Aucune recette trouvée avec cette combinaison ! Ingrédients détruits.',
          discovered: false,
        });
      }

      console.log('✅ Recette trouvée, vérification si déjà découverte...');

      // Vérifier si déjà découverte
      const alreadyDiscovered = await UserDiscoveredRecipe.findOne({
        where: {
          user_id: userId,
          recipe_id: matchingRecipe.id,
        },
      });

      if (alreadyDiscovered) {
        console.log('🔄 Recette déjà découverte - Fin\n');
        return res.json({
          success: true,
          message: '🔄 Vous avez déjà découvert cette recette !',
          recipe: {
            id: matchingRecipe.id,
            name: matchingRecipe.name,
            description: (matchingRecipe as any).description,
            sale_price: matchingRecipe.sale_price,
          },
          discovered: false,
          alreadyKnown: true,
        });
      }

      console.log('🎉 Nouvelle découverte ! Sauvegarde...');

      // Nouvelle découverte !
      await UserDiscoveredRecipe.create({
        user_id: userId!,
        recipe_id: matchingRecipe.id,
      });

      console.log('✅ Sauvegarde OK, récupération détails...');

      // Récupérer la recette complète avec ingrédients
      const fullRecipe = await Recipe.findByPk(matchingRecipe.id, {
        include: [
          {
            model: Ingredient,
            as: 'Ingredients',
            through: { attributes: ['quantity'] },
          },
        ],
      });

      const ingredients =
        (fullRecipe as any)?.Ingredients?.map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.RecipeIngredient?.quantity || 1,
        })) || [];

      console.log('✅ SUCCESS - Fin\n');

      return res.json({
        success: true,
        message: `🎉 Félicitations ! Vous avez découvert : ${matchingRecipe.name} !`,
        recipe: {
          id: matchingRecipe.id,
          name: matchingRecipe.name,
          description: (matchingRecipe as any).description,
          sale_price: matchingRecipe.sale_price,
          ingredients,
        },
        discovered: true,
        alreadyKnown: false,
      });
    } catch (error) {
      console.error('\n❌ ========== ERREUR SERVEUR ==========');
      console.error('Type:', (error as Error).name);
      console.error('Message:', (error as Error).message);
      console.error('Stack:', (error as Error).stack);
      console.error('========================================\n');

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'expérimentation",
        error: (error as Error).message,
        type: (error as Error).name,
      });
    }
  }
);

// Fonction helper pour trouver une recette correspondante
async function findMatchingRecipe(ingredientIds: number[]) {
  try {
    console.log('🔍 findMatchingRecipe - Recherche en base...');

    // Récupérer toutes les recettes avec leurs ingrédients
    const recipes = await Recipe.findAll({
      include: [
        {
          model: Ingredient,
          as: 'Ingredients',
          through: { attributes: [] },
        },
      ],
    });

    console.log(`📊 ${recipes.length} recettes trouvées en base`);

    if (recipes.length === 0) {
      console.warn('⚠️  AUCUNE RECETTE EN BASE !');
      return null;
    }

    // Trier les IDs fournis
    const sortedSelectedIds = [...ingredientIds].sort((a, b) => a - b);
    console.log('🔢 IDs triés:', sortedSelectedIds);

    // Chercher une correspondance
    for (const recipe of recipes) {
      const recipeIngredients = (recipe as any).Ingredients || [];

      if (recipeIngredients.length === 0) {
        console.log(
          `  ⚠️  ${recipe.name}: 0 ingrédients (association manquante ?)`
        );
        continue;
      }

      const recipeIngredientIds = recipeIngredients
        .map((i: any) => i.id)
        .sort((a: number, b: number) => a - b);

      console.log(`  🔍 ${recipe.name}: [${recipeIngredientIds.join(', ')}]`);

      // Comparaison exacte
      if (
        recipeIngredientIds.length === sortedSelectedIds.length &&
        recipeIngredientIds.every(
          (id: number, index: number) => id === sortedSelectedIds[index]
        )
      ) {
        console.log(`  ✅ MATCH TROUVÉ avec ${recipe.name} !`);
        return recipe;
      }
    }

    console.log('❌ Aucun match trouvé');
    return null;
  } catch (error) {
    console.error('❌ Erreur dans findMatchingRecipe:');
    console.error('Message:', (error as Error).message);
    console.error('Stack:', (error as Error).stack);
    throw error;
  }
}

export default router;

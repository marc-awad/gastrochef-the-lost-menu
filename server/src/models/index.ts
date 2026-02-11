import { Recipe } from './Recipe';
import { Ingredient } from './Ingredient';
import { RecipeIngredient } from './RecipeIngredient';
import { UserDiscoveredRecipe } from './UserDiscoveredRecipe';
import { User } from './User';

// Recipe <-> Ingredient
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipe_id',
});
Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredient_id',
});

// User <-> Recipe discovered
User.belongsToMany(Recipe, {
  through: UserDiscoveredRecipe,
  foreignKey: 'user_id',
});
Recipe.belongsToMany(User, {
  through: UserDiscoveredRecipe,
  foreignKey: 'recipe_id',
});

// ✅ AJOUTE CES EXPORTS
export { User, Ingredient, Recipe, RecipeIngredient, UserDiscoveredRecipe };

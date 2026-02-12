import { Recipe } from './Recipe';
import { Ingredient } from './Ingredient';
import { RecipeIngredient } from './RecipeIngredient';
import { User } from './User';
import { UserDiscoveredRecipe } from './UserDiscoveredRecipe';
import { Order } from './Order';

// ========================================
// ASSOCIATIONS RECIPE <-> INGREDIENT
// ========================================

Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipe_id',
  otherKey: 'ingredient_id',
  as: 'Ingredients',
});

Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredient_id',
  otherKey: 'recipe_id',
  as: 'Recipes',
});

// ========================================
// ASSOCIATIONS RECIPEINGREDIENT
// ========================================

RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
RecipeIngredient.belongsTo(Ingredient, {
  foreignKey: 'ingredient_id',
  as: 'ingredient',
});
Recipe.hasMany(RecipeIngredient, {
  foreignKey: 'recipe_id',
  as: 'recipeIngredients',
});
Ingredient.hasMany(RecipeIngredient, {
  foreignKey: 'ingredient_id',
  as: 'recipeIngredients',
});

// ========================================
// ASSOCIATIONS USER <-> RECIPE (DISCOVERED)
// ========================================

User.belongsToMany(Recipe, {
  through: UserDiscoveredRecipe,
  foreignKey: 'user_id',
  otherKey: 'recipe_id',
  as: 'discoveredRecipes',
});

Recipe.belongsToMany(User, {
  through: UserDiscoveredRecipe,
  foreignKey: 'recipe_id',
  otherKey: 'user_id',
  as: 'discoverers',
});

UserDiscoveredRecipe.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserDiscoveredRecipe.belongsTo(Recipe, {
  foreignKey: 'recipe_id',
  as: 'recipe',
});
User.hasMany(UserDiscoveredRecipe, {
  foreignKey: 'user_id',
  as: 'discoveries',
});
Recipe.hasMany(UserDiscoveredRecipe, {
  foreignKey: 'recipe_id',
  as: 'discoveries',
});

// ========================================
// ASSOCIATIONS ORDER
// ========================================

// Order appartient à un User
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// Order appartient à une Recipe
Order.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
Recipe.hasMany(Order, { foreignKey: 'recipe_id', as: 'orders' });

// ========================================
// EXPORTS
// ========================================

export {
  Recipe,
  Ingredient,
  RecipeIngredient,
  User,
  UserDiscoveredRecipe,
  Order,
};

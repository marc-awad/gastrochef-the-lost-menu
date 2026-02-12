// server/src/models/index.ts
// Ce fichier configure toutes les associations entre les models

import { Recipe } from './Recipe';
import { Ingredient } from './Ingredient';
import { RecipeIngredient } from './RecipeIngredient';
import { User } from './User';
import { UserDiscoveredRecipe } from './UserDiscoveredRecipe';

// ========================================
// ASSOCIATIONS RECIPE <-> INGREDIENT
// ========================================

// Recipe a plusieurs Ingredients (many-to-many via RecipeIngredient)
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipe_id',
  otherKey: 'ingredient_id',
  as: 'Ingredients', // Nom de l'association
});

// Ingredient appartient à plusieurs Recipes
Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredient_id',
  otherKey: 'recipe_id',
  as: 'Recipes',
});

// ========================================
// ASSOCIATIONS RECIPEINGREDIENT
// ========================================

// RecipeIngredient appartient à Recipe
RecipeIngredient.belongsTo(Recipe, {
  foreignKey: 'recipe_id',
  as: 'recipe',
});

// RecipeIngredient appartient à Ingredient
RecipeIngredient.belongsTo(Ingredient, {
  foreignKey: 'ingredient_id',
  as: 'ingredient',
});

// Recipe a plusieurs RecipeIngredients
Recipe.hasMany(RecipeIngredient, {
  foreignKey: 'recipe_id',
  as: 'recipeIngredients',
});

// Ingredient a plusieurs RecipeIngredients
Ingredient.hasMany(RecipeIngredient, {
  foreignKey: 'ingredient_id',
  as: 'recipeIngredients',
});

// ========================================
// ASSOCIATIONS USER <-> RECIPE (DISCOVERED)
// ========================================

// User a plusieurs Recipes découvertes
User.belongsToMany(Recipe, {
  through: UserDiscoveredRecipe,
  foreignKey: 'user_id',
  otherKey: 'recipe_id',
  as: 'discoveredRecipes',
});

// Recipe est découverte par plusieurs Users
Recipe.belongsToMany(User, {
  through: UserDiscoveredRecipe,
  foreignKey: 'recipe_id',
  otherKey: 'user_id',
  as: 'discoverers',
});

// UserDiscoveredRecipe appartient à User
UserDiscoveredRecipe.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// UserDiscoveredRecipe appartient à Recipe
UserDiscoveredRecipe.belongsTo(Recipe, {
  foreignKey: 'recipe_id',
  as: 'recipe',
});

// User a plusieurs UserDiscoveredRecipes
User.hasMany(UserDiscoveredRecipe, {
  foreignKey: 'user_id',
  as: 'discoveries',
});

// Recipe a plusieurs UserDiscoveredRecipes
Recipe.hasMany(UserDiscoveredRecipe, {
  foreignKey: 'recipe_id',
  as: 'discoveries',
});

// ========================================
// EXPORTS
// ========================================

export { Recipe, Ingredient, RecipeIngredient, User, UserDiscoveredRecipe };

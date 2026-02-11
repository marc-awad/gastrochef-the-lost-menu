import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { Recipe } from './Recipe';
import { Ingredient } from './Ingredient';

export class RecipeIngredient extends Model {
  declare recipe_id: number;
  declare ingredient_id: number;
  declare quantity: number;
}

RecipeIngredient.init(
  {
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: Recipe, key: 'id' },
      primaryKey: true,
    },
    ingredient_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: Ingredient, key: 'id' },
      primaryKey: true,
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'recipe_ingredients' }
);

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { User } from './User';
import { Recipe } from './Recipe';

export class UserDiscoveredRecipe extends Model {
  declare user_id: number;
  declare recipe_id: number;
}

UserDiscoveredRecipe.init(
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: User, key: 'id' },
      primaryKey: true,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: Recipe, key: 'id' },
      primaryKey: true,
    },
  },
  { sequelize, tableName: 'user_discovered_recipes' }
);

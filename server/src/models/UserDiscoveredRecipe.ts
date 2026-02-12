import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import { User } from './User';
import { Recipe } from './Recipe';

export class UserDiscoveredRecipe extends Model {
  declare user_id: number;
  declare recipe_id: number;
  declare discovered_at: Date; // Ajout du champ discovered_at
}

UserDiscoveredRecipe.init(
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: User, key: 'id' },
      primaryKey: true,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: Recipe, key: 'id' },
      primaryKey: true,
      allowNull: false,
    },
    discovered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Date automatique
    },
  },
  {
    sequelize,
    tableName: 'user_discovered_recipes',
    timestamps: false, // Pas besoin de createdAt/updatedAt, on a discovered_at
  }
);

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Recipe extends Model {
  declare id: number;
  declare name: string;
  declare description?: string; // Ajout du champ description
  declare sale_price: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Une délicieuse recette à découvrir !',
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    tableName: 'recipes',
    timestamps: true, // Active createdAt et updatedAt
  }
);

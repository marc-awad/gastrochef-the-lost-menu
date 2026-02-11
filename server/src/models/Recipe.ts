import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Recipe extends Model {
  declare id: number;
  declare name: string;
  declare sale_price: number;
}

Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    sale_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, tableName: 'recipes' }
);

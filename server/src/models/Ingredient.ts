import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Ingredient extends Model {
  declare id: number;
  declare name: string;
  declare price: number;
}

Ingredient.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, tableName: 'ingredients' }
);

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Inventory extends Model {
  public id!: number;
  public user_id!: number;
  public ingredient_id!: number;
  public quantity!: number;
  public purchased_at!: Date;
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    ingredient_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'inventory',
    sequelize,
    timestamps: false, // On gère purchased_at manuellement
    indexes: [
      {
        // Index unique pour éviter les doublons user+ingredient
        // On fait un UPDATE quantity au lieu d'INSERT si la ligne existe
        unique: true,
        fields: ['user_id', 'ingredient_id'],
        name: 'uq_inventory_user_ingredient',
      },
    ],
  }
);

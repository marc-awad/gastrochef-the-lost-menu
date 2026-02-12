import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export type OrderStatus = 'pending' | 'served' | 'expired';

export class Order extends Model {
  public id!: number;
  public user_id!: number;
  public recipe_id!: number;
  public status!: OrderStatus;
  public price!: number;
  public expires_at!: Date;
  public is_vip!: boolean;
  public readonly created_at!: Date;
}

Order.init(
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
    recipe_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'served', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_vip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orders',
    sequelize,
    timestamps: false,
  }
);

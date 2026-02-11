import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class User extends Model {
  public id!: number;
  public restaurant_name!: string;
  public email!: string;
  public password_hash!: string;
  public treasury!: number;
  public satisfaction!: number;
  public stars!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurant_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    treasury: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
    },
    satisfaction: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
    stars: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
  },
  {
    tableName: 'users',
    sequelize,
  }
);

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export type TransactionType =
  | 'order_revenue' // Revenu d'une commande servie
  | 'ingredient_purchase' // Achat d'ingrédients
  | 'vip_bonus' // Bonus commande VIP réussie
  | 'vip_penalty' // Pénalité commande VIP ratée
  | 'initial_treasury'; // Trésorerie initiale à la création du compte

export class Transaction extends Model {
  public id!: number;
  public user_id!: number;
  public type!: TransactionType;
  public amount!: number; // Positif = crédit, négatif = débit
  public description!: string;
  public balance_after!: number; // Trésorerie après l'opération
  public created_at!: Date;
}

Transaction.init(
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
    type: {
      type: DataTypes.ENUM(
        'order_revenue',
        'ingredient_purchase',
        'vip_bonus',
        'vip_penalty',
        'initial_treasury'
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Positif = crédit, négatif = débit',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Trésorerie du joueur après cette transaction',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'transactions',
    sequelize,
    timestamps: false, // On gère created_at manuellement
  }
);

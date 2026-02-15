import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Inventory extends Model {
  public id!: number;
  public user_id!: number;
  public ingredient_id!: number;
  public quantity!: number;
  public purchased_at!: Date;
  public expiration_date!: Date; // ✅ TICKET #021
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
    // ✅ TICKET #021 : Date de péremption (achat + 7 jours)
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'inventory',
    sequelize,
    timestamps: false,
    // ✅ TICKET #021 : SUPPRESSION de l'index unique pour permettre le FIFO
    // Maintenant on peut avoir plusieurs lignes pour le même (user_id, ingredient_id)
    // avec des dates d'achat et d'expiration différentes
    indexes: [
      {
        // Index non-unique pour optimiser les requêtes
        fields: ['user_id', 'ingredient_id'],
        name: 'idx_inventory_user_ingredient',
      },
      {
        // Index pour le tri FIFO (par date d'expiration)
        fields: ['user_id', 'ingredient_id', 'expiration_date'],
        name: 'idx_inventory_fifo',
      },
      {
        // Index pour le cron job (trouver les périmés rapidement)
        fields: ['expiration_date'],
        name: 'idx_inventory_expiration',
      },
    ],
  }
);

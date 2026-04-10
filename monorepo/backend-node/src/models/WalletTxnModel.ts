/**
 * WalletTxn Sequelize model — data definition only.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface WalletTxnAttributes {
  id: number;
  providerId: number;
  bookingId: number | null;
  amount: number;
  type: 'credit' | 'debit';
  note: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WalletTxnCreationAttributes
  extends Optional<WalletTxnAttributes, 'id' | 'bookingId' | 'note' | 'createdAt' | 'updatedAt'> {}

export class WalletTxnModel
  extends Model<WalletTxnAttributes, WalletTxnCreationAttributes>
  implements WalletTxnAttributes
{
  public id!: number;
  public providerId!: number;
  public bookingId!: number | null;
  public amount!: number;
  public type!: 'credit' | 'debit';
  public note!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initWalletTxnModel(sequelize: Sequelize): typeof WalletTxnModel {
  WalletTxnModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      providerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'providers', key: 'id' },
      },
      bookingId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('credit', 'debit'),
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'WalletTxn',
      tableName: 'wallet_txns',
      underscored: true,
    }
  );
  return WalletTxnModel;
}

/**
 * Payment Sequelize model — data definition only.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface PaymentAttributes {
  id: number;
  userId: number;
  type: 'registration' | 'service';
  referenceId: number | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes
  extends Optional<
    PaymentAttributes,
    'id' | 'referenceId' | 'razorpayOrderId' | 'razorpayPaymentId' | 'createdAt' | 'updatedAt'
  > {}

export class PaymentModel
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: number;
  public userId!: number;
  public type!: 'registration' | 'service';
  public referenceId!: number | null;
  public razorpayOrderId!: string | null;
  public razorpayPaymentId!: string | null;
  public amount!: number;
  public status!: 'pending' | 'paid' | 'failed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initPaymentModel(sequelize: Sequelize): typeof PaymentModel {
  PaymentModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      type: {
        type: DataTypes.ENUM('registration', 'service'),
        allowNull: false,
      },
      referenceId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      razorpayOrderId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      razorpayPaymentId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
    }
  );
  return PaymentModel;
}

/**
 * Account settings model — admin-managed payment configuration.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AccountSettingAttributes {
  id: number;
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
  upiId: string | null;
  codEnabled: boolean;
  registrationFee: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountSettingCreationAttributes
  extends Optional<
    AccountSettingAttributes,
    'id' | 'razorpayKeyId' | 'razorpayKeySecret' | 'upiId' | 'codEnabled' | 'registrationFee' | 'createdAt' | 'updatedAt'
  > {}

export class AccountSettingModel
  extends Model<AccountSettingAttributes, AccountSettingCreationAttributes>
  implements AccountSettingAttributes
{
  public id!: number;
  public razorpayKeyId!: string | null;
  public razorpayKeySecret!: string | null;
  public upiId!: string | null;
  public codEnabled!: boolean;
  public registrationFee!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initAccountSettingModel(sequelize: Sequelize): typeof AccountSettingModel {
  AccountSettingModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      razorpayKeyId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      razorpayKeySecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      upiId: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      codEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      registrationFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 999,
      },
    },
    {
      sequelize,
      modelName: 'AccountSetting',
      tableName: 'account_settings',
      underscored: true,
    }
  );

  return AccountSettingModel;
}

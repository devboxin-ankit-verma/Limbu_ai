/**
 * Provider Sequelize model — data definition only.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface ProviderAttributes {
  id: number;
  userId: number;
  bio: string | null;
  photos: string[];
  expertise: string[];
  status: 'pending' | 'approved' | 'rejected';
  walletBalance: number;
  registrationFeePaidAt: Date | null;
  providerCode: string | null;
  referredUsersCount: number;
  registrationRefundPaidAt: Date | null;
  serviceActiveSince: Date | null;
  continuityBonusPaidAt: Date | null;
  // Identity & verification documents
  aadhaarUrl: string | null;
  passportPhotoUrl: string | null;
  identityHidden: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProviderCreationAttributes
  extends Optional<
    ProviderAttributes,
    | 'id'
    | 'bio'
    | 'photos'
    | 'expertise'
    | 'walletBalance'
    | 'registrationFeePaidAt'
    | 'providerCode'
    | 'referredUsersCount'
    | 'registrationRefundPaidAt'
    | 'serviceActiveSince'
    | 'continuityBonusPaidAt'
    | 'aadhaarUrl'
    | 'passportPhotoUrl'
    | 'identityHidden'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class ProviderModel
  extends Model<ProviderAttributes, ProviderCreationAttributes>
  implements ProviderAttributes
{
  public id!: number;
  public userId!: number;
  public bio!: string | null;
  public photos!: string[];
  public expertise!: string[];
  public status!: 'pending' | 'approved' | 'rejected';
  public walletBalance!: number;
  public registrationFeePaidAt!: Date | null;
  public providerCode!: string | null;
  public referredUsersCount!: number;
  public registrationRefundPaidAt!: Date | null;
  public serviceActiveSince!: Date | null;
  public continuityBonusPaidAt!: Date | null;
  public aadhaarUrl!: string | null;
  public passportPhotoUrl!: string | null;
  public identityHidden!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initProviderModel(sequelize: Sequelize): typeof ProviderModel {
  ProviderModel.init(
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
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      photos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      expertise: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      walletBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      registrationFeePaidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      providerCode: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      referredUsersCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      registrationRefundPaidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      serviceActiveSince: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      continuityBonusPaidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      aadhaarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      passportPhotoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      identityHidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Provider',
      tableName: 'providers',
      underscored: true,
    }
  );
  return ProviderModel;
}

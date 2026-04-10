/**
 * MassageService Sequelize model — data definition only.
 *
 * Named MassageServiceModel to avoid collision with the Node.js Service type.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface MassageServiceAttributes {
  id: number;
  providerId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  durationMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MassageServiceCreationAttributes
  extends Optional<MassageServiceAttributes, 'id' | 'description' | 'imageUrl' | 'createdAt' | 'updatedAt'> {}

export class MassageServiceModel
  extends Model<MassageServiceAttributes, MassageServiceCreationAttributes>
  implements MassageServiceAttributes
{
  public id!: number;
  public providerId!: number;
  public name!: string;
  public description!: string | null;
  public imageUrl!: string | null;
  public price!: number;
  public durationMinutes!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initMassageServiceModel(sequelize: Sequelize): typeof MassageServiceModel {
  MassageServiceModel.init(
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
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      durationMinutes: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'MassageService',
      tableName: 'services',
      underscored: true,
    }
  );
  return MassageServiceModel;
}

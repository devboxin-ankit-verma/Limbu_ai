/**
 * Booking Sequelize model — data definition only.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface BookingAttributes {
  id: number;
  customerId: number;
  providerId: number;
  serviceId: number;
  scheduledAt: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingCreationAttributes
  extends Optional<BookingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class BookingModel
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public customerId!: number;
  public providerId!: number;
  public serviceId!: number;
  public scheduledAt!: Date;
  public status!: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  public amount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initBookingModel(sequelize: Sequelize): typeof BookingModel {
  BookingModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      providerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'providers', key: 'id' },
      },
      serviceId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'services', key: 'id' },
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      underscored: true,
    }
  );
  return BookingModel;
}

/**
 * Provider review model — service taker feedback after booking.
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface ReviewAttributes {
  id: number;
  bookingId: number;
  providerId: number;
  customerId: number;
  rating: number;
  comment: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewCreationAttributes
  extends Optional<ReviewAttributes, 'id' | 'comment' | 'createdAt' | 'updatedAt'> {}

export class ReviewModel
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: number;
  public bookingId!: number;
  public providerId!: number;
  public customerId!: number;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initReviewModel(sequelize: Sequelize): typeof ReviewModel {
  ReviewModel.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'bookings', key: 'id' },
      },
      providerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'providers', key: 'id' },
      },
      customerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      rating: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'reviews',
      underscored: true,
    }
  );

  return ReviewModel;
}

/**
 * Review repository — database access for provider reviews.
 */

import { ReviewCreationAttributes, ReviewModel } from '../models/ReviewModel';
import { UserModel } from '../models/UserModel';

export class ReviewRepository {
  async create(data: ReviewCreationAttributes): Promise<ReviewModel> {
    return ReviewModel.create(data);
  }

  async findByProvider(providerId: number, offset: number = 0, limit: number = 20): Promise<ReviewModel[]> {
    return ReviewModel.findAll({
      where: { providerId },
      include: [{ model: UserModel, as: 'customer', attributes: ['id', 'name'] }],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async avgRatingByProvider(providerId: number): Promise<number> {
    const value = await ReviewModel.sum('rating', { where: { providerId } });
    const count = await ReviewModel.count({ where: { providerId } });
    if (!count) return 0;
    return Number(value || 0) / count;
  }
}

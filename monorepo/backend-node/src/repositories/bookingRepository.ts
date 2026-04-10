/**
 * Booking repository — database access only.
 */

import { BookingModel, BookingCreationAttributes } from '../models/BookingModel';
import { ProviderModel } from '../models/ProviderModel';
import { MassageServiceModel } from '../models/ServiceModel';
import { UserModel } from '../models/UserModel';

export class BookingRepository {
  async findById(id: number): Promise<BookingModel | null> {
    return BookingModel.findByPk(id, {
      include: [
        { model: UserModel, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
        {
          model: ProviderModel,
          as: 'provider',
          include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'phone'] }],
        },
        { model: MassageServiceModel, as: 'service' },
      ],
    });
  }

  async findByCustomer(customerId: number, offset: number = 0, limit: number = 20): Promise<BookingModel[]> {
    return BookingModel.findAll({
      where: { customerId },
      include: [
        {
          model: ProviderModel,
          as: 'provider',
          include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'phone'] }],
        },
        { model: MassageServiceModel, as: 'service' },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async findByProvider(providerId: number, offset: number = 0, limit: number = 20): Promise<BookingModel[]> {
    return BookingModel.findAll({
      where: { providerId },
      include: [
        { model: UserModel, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
        { model: MassageServiceModel, as: 'service' },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async findAll(offset: number = 0, limit: number = 50): Promise<BookingModel[]> {
    return BookingModel.findAll({
      include: [
        { model: UserModel, as: 'customer', attributes: ['id', 'name', 'phone'] },
        {
          model: ProviderModel,
          as: 'provider',
          include: [{ model: UserModel, as: 'user', attributes: ['id', 'name'] }],
        },
        { model: MassageServiceModel, as: 'service' },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async count(): Promise<number> {
    return BookingModel.count();
  }

  async countCompletedByProvider(providerId: number): Promise<number> {
    return BookingModel.count({
      where: { providerId, status: 'completed' },
    });
  }

  async create(data: BookingCreationAttributes): Promise<BookingModel> {
    return BookingModel.create(data);
  }

  async updateStatus(
    id: number,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(id);
    if (!booking) return null;
    return booking.update({ status });
  }
}

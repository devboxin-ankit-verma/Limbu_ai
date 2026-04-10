/**
 * Provider repository — database access only.
 */

import { Op } from 'sequelize';
import { ProviderModel, ProviderAttributes, ProviderCreationAttributes } from '../models/ProviderModel';
import { UserModel } from '../models/UserModel';
import { MassageServiceModel } from '../models/ServiceModel';

export class ProviderRepository {
  async findById(id: number): Promise<ProviderModel | null> {
    return ProviderModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email'],
          required: true,
        },
        { model: MassageServiceModel, as: 'services' },
      ],
    });
  }

  async findByUserId(userId: number): Promise<ProviderModel | null> {
    return ProviderModel.findOne({
      where: { userId },
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email'],
          required: true,
        },
        { model: MassageServiceModel, as: 'services' },
      ],
    });
  }

  async findApproved(offset: number = 0, limit: number = 20): Promise<ProviderModel[]> {
    return ProviderModel.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email'],
          required: true,
        },
        { model: MassageServiceModel, as: 'services' },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async findByStatus(
    status: 'pending' | 'approved' | 'rejected',
    offset: number = 0,
    limit: number = 50
  ): Promise<ProviderModel[]> {
    return ProviderModel.findAll({
      where: { status },
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email'],
          required: true,
        },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async count(status?: 'pending' | 'approved' | 'rejected'): Promise<number> {
    const where = status ? { status } : {};
    return ProviderModel.count({ where });
  }

  async create(data: ProviderCreationAttributes): Promise<ProviderModel> {
    return ProviderModel.create(data);
  }

  async update(id: number, data: Partial<ProviderAttributes>): Promise<ProviderModel | null> {
    const provider = await ProviderModel.findByPk(id);
    if (!provider) return null;
    return provider.update(data);
  }

  async incrementWallet(id: number, amount: number): Promise<void> {
    await ProviderModel.increment({ walletBalance: amount }, { where: { id } });
  }
}

/**
 * MassageService repository — database access only.
 */

import { MassageServiceModel, MassageServiceCreationAttributes } from '../models/ServiceModel';

export class MassageServiceRepository {
  async findById(id: number): Promise<MassageServiceModel | null> {
    return MassageServiceModel.findByPk(id);
  }

  async findByProvider(providerId: number): Promise<MassageServiceModel[]> {
    return MassageServiceModel.findAll({
      where: { providerId },
      order: [['createdAt', 'ASC']],
    });
  }

  async create(data: MassageServiceCreationAttributes): Promise<MassageServiceModel> {
    return MassageServiceModel.create(data);
  }

  async bulkCreate(items: MassageServiceCreationAttributes[]): Promise<MassageServiceModel[]> {
    return MassageServiceModel.bulkCreate(items);
  }

  async delete(id: number): Promise<void> {
    await MassageServiceModel.destroy({ where: { id } });
  }

  async deleteByProvider(providerId: number): Promise<void> {
    await MassageServiceModel.destroy({ where: { providerId } });
  }
}

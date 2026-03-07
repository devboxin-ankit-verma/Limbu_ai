/**
 * Position service - business logic for positions.
 */

import { PositionRepository } from '../repositories/positionRepository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class PositionService {
  constructor(private readonly positionRepo: PositionRepository) {}

  async list(options: Parameters<PositionRepository['findMany']>[0]) {
    return this.positionRepo.findMany(options);
  }

  async getById(id: number) {
    const pos = await this.positionRepo.findById(id);
    if (!pos) throw new NotFoundError('Position not found');
    return pos;
  }

  async close(id: number) {
    const pos = await this.positionRepo.findById(id);
    if (!pos) throw new NotFoundError('Position not found');
    if (pos.closedAt) throw new ValidationError('Position already closed');
    await this.positionRepo.close(id);
    return (await this.positionRepo.findById(id))!;
  }
}

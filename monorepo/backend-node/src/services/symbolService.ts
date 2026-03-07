/**
 * Symbol (instrument) service - business logic for symbols and markets.
 */

import { SymbolRepository } from '../repositories/symbolRepository';
import { NotFoundError } from '../utils/errors';

export class SymbolService {
  constructor(private readonly symbolRepo: SymbolRepository) {}

  async list(options: Parameters<SymbolRepository['findMany']>[0]) {
    return this.symbolRepo.findMany(options);
  }

  async getById(id: number) {
    const s = await this.symbolRepo.findById(id);
    if (!s) throw new NotFoundError('Symbol not found');
    return s;
  }

  async create(data: { code: string; name: string; marketId: number; lotSize: number; tickSize: number; isActive?: boolean }) {
    return this.symbolRepo.create(data);
  }

  async update(id: number, data: { code?: string; name?: string; isActive?: boolean }) {
    const updated = await this.symbolRepo.update(id, data);
    if (!updated) throw new NotFoundError('Symbol not found');
    return updated;
  }

  async toggleActive(id: number) {
    const s = await this.symbolRepo.findById(id);
    if (!s) throw new NotFoundError('Symbol not found');
    const updated = await this.symbolRepo.update(id, { isActive: !s.isActive });
    if (!updated) throw new NotFoundError('Symbol not found');
    return updated;
  }
}

/**
 * Trade service - business logic for executed trades.
 */

import { TradeRepository } from '../repositories/tradeRepository';
import { ListTradesOptions } from '../repositories/tradeRepository';

export class TradeService {
  constructor(private readonly tradeRepo: TradeRepository) {}

  async list(options: ListTradesOptions) {
    return this.tradeRepo.findMany(options);
  }
}

/**
 * Order service - business logic for orders.
 *
 * Create, list, execute, cancel. Execute creates trade and updates wallet/position.
 * Optionally emits Socket.IO events for realtime clients.
 */

import { Decimal } from '@prisma/client/runtime/library';
import { Server as SocketServer } from 'socket.io';
import { OrderRepository, OrderRecord } from '../repositories/orderRepository';
import { TradeRepository } from '../repositories/tradeRepository';
import { WalletRepository } from '../repositories/walletRepository';
import { PositionRepository } from '../repositories/positionRepository';
import { SymbolRepository } from '../repositories/symbolRepository';
import { UserRepository } from '../repositories/userRepository';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateOrderInput {
  userId: number;
  symbolId: number;
  side: string;
  type: string;
  quantity: number;
  price?: number | null;
}

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly tradeRepo: TradeRepository,
    private readonly walletRepo: WalletRepository,
    private readonly positionRepo: PositionRepository,
    private readonly symbolRepo: SymbolRepository,
    private readonly userRepo: UserRepository,
    private readonly io?: SocketServer
  ) {}

  async create(input: CreateOrderInput): Promise<OrderRecord> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const symbol = await this.symbolRepo.findById(input.symbolId);
    if (!symbol) throw new NotFoundError('Symbol not found');
    if (!['buy', 'sell'].includes(input.side)) throw new ValidationError('Invalid side');
    if (!['market', 'limit'].includes(input.type)) throw new ValidationError('Invalid order type');
    if (input.type === 'limit' && (input.price == null || input.price <= 0)) {
      throw new ValidationError('Limit order requires price');
    }
    const order = await this.orderRepo.create({
      userId: input.userId,
      symbolId: input.symbolId,
      side: input.side,
      type: input.type,
      quantity: new Decimal(input.quantity),
      price: input.price != null ? new Decimal(input.price) : null
    });
    return (await this.orderRepo.findById(order.id))!;
  }

  async getById(id: number) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  async list(options: Parameters<OrderRepository['findMany']>[0]) {
    return this.orderRepo.findMany(options);
  }

  async cancel(id: number) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== 'pending' && order.status !== 'partially_filled') {
      throw new ValidationError('Order cannot be cancelled');
    }
    await this.orderRepo.updateStatus(id, 'cancelled');
    return (await this.orderRepo.findById(id))!;
  }

  /**
   * Execute order: create one trade at order price (or market price), update order, wallet, position.
   */
  async execute(id: number, executionPrice: number, brokerage: number = 0) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    if (order.status === 'filled' || order.status === 'cancelled') {
      throw new ValidationError('Order cannot be executed');
    }
    const qty = Number(order.quantity) - Number(order.filledQty);
    if (qty <= 0) throw new ValidationError('Order already filled');

    const trade = await this.tradeRepo.create({
      orderId: order.id,
      userId: order.userId,
      symbolId: order.symbolId,
      side: order.side,
      quantity: qty,
      price: executionPrice,
      brokerage
    });

    const newFilled = Number(order.filledQty) + qty;
    const newStatus = newFilled >= Number(order.quantity) ? 'filled' : 'partially_filled';
    await this.orderRepo.updateStatus(id, newStatus, newFilled);

    const wallet = await this.walletRepo.findOrCreateForUser(order.userId);
    const debit = executionPrice * qty + brokerage;
    const credit = executionPrice * qty - brokerage;
    if (order.side === 'buy') {
      await this.walletRepo.updateBalance(wallet.id, -debit, 0);
      await this.walletRepo.addTransaction({
        walletId: wallet.id,
        type: 'trade',
        amount: -debit,
        refId: trade.id,
        refType: 'trade'
      });
    } else {
      await this.walletRepo.updateBalance(wallet.id, credit, 0);
      await this.walletRepo.addTransaction({
        walletId: wallet.id,
        type: 'trade',
        amount: credit,
        refId: trade.id,
        refType: 'trade'
      });
    }
    if (brokerage > 0) {
      await this.walletRepo.updateBalance(wallet.id, -brokerage, 0);
      await this.walletRepo.addTransaction({
        walletId: wallet.id,
        type: 'brokerage',
        amount: -brokerage,
        refId: trade.id,
        refType: 'trade'
      });
    }

    const pos = await this.positionRepo.findOpenByUserSymbolSide(
      order.userId,
      order.symbolId,
      order.side
    );
    if (pos) {
      const newQty = Number(pos.quantity) + qty;
      const newAvg = (Number(pos.avgPrice) * Number(pos.quantity) + executionPrice * qty) / newQty;
      await this.positionRepo.updateQuantityAndPrice(pos.id, newQty, newAvg, executionPrice);
    } else {
      await this.positionRepo.create({
        userId: order.userId,
        symbolId: order.symbolId,
        side: order.side,
        quantity: qty,
        avgPrice: executionPrice
      });
    }

    if (this.io) {
      this.io.emit('trade:executed', {
        orderId: id,
        tradeId: trade.id,
        userId: order.userId,
        symbolId: order.symbolId,
        side: order.side,
        quantity: qty,
        price: executionPrice,
        brokerage,
        executedAt: new Date().toISOString()
      });
      this.io.emit('position:updated', { userId: order.userId, symbolId: order.symbolId });
    }

    return (await this.orderRepo.findById(id))!;
  }
}

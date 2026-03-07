/**
 * Register app-scoped dependencies (repositories, services) on the Express app.
 * Controllers resolve them via req.app.get("..."). Single place to build the object graph.
 */

import { Express } from 'express';
import { Server as SocketServer } from 'socket.io';
import { prisma } from '../lib/prisma';
import { UserRepository } from '../repositories/userRepository';
import { AdminUserRepository } from '../repositories/adminUserRepository';
import { OrderRepository } from '../repositories/orderRepository';
import { TradeRepository } from '../repositories/tradeRepository';
import { WalletRepository } from '../repositories/walletRepository';
import { PositionRepository } from '../repositories/positionRepository';
import { SymbolRepository } from '../repositories/symbolRepository';
import { MarketRepository } from '../repositories/marketRepository';
import { NoticeRepository } from '../repositories/noticeRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuthService } from '../services/authService';
import { OrderService } from '../services/orderService';
import { TradeService } from '../services/tradeService';
import { PositionService } from '../services/positionService';
import { WalletService } from '../services/walletService';
import { SymbolService } from '../services/symbolService';
import { ReportService } from '../services/reportService';
import { NoticeService } from '../services/noticeService';
import { NotificationService } from '../services/notificationService';

export function registerRepositories(app: Express): void {
  app.set('prisma', prisma);
  app.set('userRepository', new UserRepository(prisma));
  app.set('adminUserRepository', new AdminUserRepository(prisma));
  app.set('authService', new AuthService(app.get('adminUserRepository') as AdminUserRepository));

  app.set('orderRepository', new OrderRepository(prisma));
  app.set('tradeRepository', new TradeRepository(prisma));
  app.set('walletRepository', new WalletRepository(prisma));
  app.set('positionRepository', new PositionRepository(prisma));
  app.set('symbolRepository', new SymbolRepository(prisma));
  app.set('marketRepository', new MarketRepository(prisma));
  app.set('noticeRepository', new NoticeRepository(prisma));
  app.set('notificationRepository', new NotificationRepository(prisma));

  const io = app.get('io') as SocketServer | undefined;
  app.set(
    'orderService',
    new OrderService(
      app.get('orderRepository') as OrderRepository,
      app.get('tradeRepository') as TradeRepository,
      app.get('walletRepository') as WalletRepository,
      app.get('positionRepository') as PositionRepository,
      app.get('symbolRepository') as SymbolRepository,
      app.get('userRepository') as UserRepository,
      io
    )
  );
  app.set('tradeService', new TradeService(app.get('tradeRepository') as TradeRepository));
  app.set('positionService', new PositionService(app.get('positionRepository') as PositionRepository));
  app.set('walletService', new WalletService(app.get('walletRepository') as WalletRepository));
  app.set('symbolService', new SymbolService(app.get('symbolRepository') as SymbolRepository));
  app.set('reportService', new ReportService(prisma));
  app.set('noticeService', new NoticeService(app.get('noticeRepository') as NoticeRepository));
  app.set(
    'notificationService',
    new NotificationService(app.get('notificationRepository') as NotificationRepository)
  );
}

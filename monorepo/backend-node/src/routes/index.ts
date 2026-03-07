/**
 * Route aggregator. Requires app to resolve auth service for protected routes.
 */

import { Express, Router } from 'express';
import { userRoutes } from './v1/userRoutes';
import { authRoutes } from './v1/authRoutes';
import { orderRoutes } from './v1/orderRoutes';
import { tradeRoutes } from './v1/tradeRoutes';
import { positionRoutes } from './v1/positionRoutes';
import { walletRoutes } from './v1/walletRoutes';
import { symbolRoutes } from './v1/symbolRoutes';
import { marketRoutes } from './v1/marketRoutes';
import { reportRoutes } from './v1/reportRoutes';
import { noticeRoutes } from './v1/noticeRoutes';
import { notificationRoutes } from './v1/notificationRoutes';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { AuthService } from '../services/authService';

export function createRoutes(app: Express): Router {
  const router = Router();
  const authService = app.get('authService') as AuthService;

  router.use(authRoutes);

  const adminRouter = Router();
  adminRouter.use(authMiddleware(authService), requireAdmin);
  adminRouter.use(userRoutes);
  adminRouter.use(orderRoutes);
  adminRouter.use(tradeRoutes);
  adminRouter.use(positionRoutes);
  adminRouter.use(walletRoutes);
  adminRouter.use(symbolRoutes);
  adminRouter.use(marketRoutes);
  adminRouter.use(reportRoutes);
  adminRouter.use(noticeRoutes);
  adminRouter.use(notificationRoutes);
  router.use(adminRouter);

  return router;
}

/**
 * Admin routes — protected, admin-role only.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { requireAdmin } from '../../middleware/adminMiddleware';
import {
  getDashboard,
  getDashboardTrends,
  listProviders,
  approveProvider,
  rejectProvider,
  listUsers,
  updateUser,
  softDeleteUser,
  restoreUser,
  listBookings,
  listPayments,
  getAccountSettings,
  updateAccountSettings,
  generateProviderCode,
  getRewardAudit,
} from '../../controllers/adminController';

const router = Router();

router.use('/admin', authenticate, requireAdmin);

router.get('/admin/dashboard', getDashboard);
router.get('/admin/dashboard/trends', getDashboardTrends);
router.get('/admin/providers', listProviders);
router.patch('/admin/providers/:id/approve', approveProvider);
router.patch('/admin/providers/:id/reject', rejectProvider);
router.post('/admin/providers/:id/generate-code', generateProviderCode);
router.get('/admin/users', listUsers);
router.patch('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', softDeleteUser);
router.patch('/admin/users/:id/restore', restoreUser);
router.get('/admin/bookings', listBookings);
router.get('/admin/payments', listPayments);
router.get('/admin/rewards/audit', getRewardAudit);
router.get('/admin/settings/account', getAccountSettings);
router.put('/admin/settings/account', updateAccountSettings);

export { router as adminRoutes };

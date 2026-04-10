/**
 * Route aggregator.
 *
 * All v1 route groups are mounted here without any extra prefix
 * (the /api/v1 prefix is applied in app.ts).
 */

import { Router } from 'express';
import { authRoutes } from './v1/authRoutes';
import { providerRoutes } from './v1/providerRoutes';
import { adminRoutes } from './v1/adminRoutes';
import { customerRoutes } from './v1/customerRoutes';
import { webhookRoutes } from './v1/webhookRoutes';

const router = Router();

router.use('/', authRoutes);
router.use('/', providerRoutes);
router.use('/', adminRoutes);
router.use('/', customerRoutes);
router.use('/', webhookRoutes);

export { router as routes };

/**
 * Report routes - under /api/v1
 */

import { Router } from 'express';
import * as reportController from '../../controllers/reportController';

const router = Router();

router.get('/reports/turnover', reportController.turnoverReport);
router.get('/reports/profit-loss', reportController.profitLossReport);
router.get('/reports/brokerage', reportController.brokerageReport);

export { router as reportRoutes };

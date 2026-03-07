/**
 * Trade routes - under /api/v1
 */

import { Router } from 'express';
import * as tradeController from '../../controllers/tradeController';

const router = Router();

router.get('/trades', tradeController.listTrades);

export { router as tradeRoutes };

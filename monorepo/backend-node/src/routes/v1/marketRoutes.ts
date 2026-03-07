/**
 * Market routes - under /api/v1
 */

import { Router } from 'express';
import * as marketController from '../../controllers/marketController';

const router = Router();

router.get('/markets', marketController.listMarkets);

export { router as marketRoutes };

/**
 * Position routes - under /api/v1
 */

import { Router } from 'express';
import * as positionController from '../../controllers/positionController';

const router = Router();

router.get('/positions', positionController.listPositions);
router.get('/positions/:id', positionController.getPosition);
router.post('/positions/:id/close', positionController.closePosition);

export { router as positionRoutes };

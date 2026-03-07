/**
 * Symbol routes - under /api/v1
 */

import { Router } from 'express';
import * as symbolController from '../../controllers/symbolController';

const router = Router();

router.get('/symbols', symbolController.listSymbols);
router.get('/symbols/:id', symbolController.getSymbol);
router.post('/symbols', symbolController.createSymbol);
router.put('/symbols/:id', symbolController.updateSymbol);
router.patch('/symbols/:id/toggle', symbolController.toggleSymbol);

export { router as symbolRoutes };

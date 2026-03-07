/**
 * Order routes - under /api/v1
 */

import { Router } from 'express';
import * as orderController from '../../controllers/orderController';

const router = Router();

router.get('/orders', orderController.listOrders);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders', orderController.createOrder);
router.post('/orders/:id/execute', orderController.executeOrder);
router.post('/orders/:id/cancel', orderController.cancelOrder);

export { router as orderRoutes };

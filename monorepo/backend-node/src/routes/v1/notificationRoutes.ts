/**
 * Notification routes - under /api/v1
 */

import { Router } from 'express';
import * as notificationController from '../../controllers/notificationController';

const router = Router();

router.get('/notifications', notificationController.listNotifications);
router.patch('/notifications/:id/read', notificationController.markNotificationRead);

export { router as notificationRoutes };

/**
 * Notice routes - under /api/v1
 */

import { Router } from 'express';
import * as noticeController from '../../controllers/noticeController';

const router = Router();

router.get('/notices', noticeController.listNotices);
router.post('/notices', noticeController.createNotice);

export { router as noticeRoutes };

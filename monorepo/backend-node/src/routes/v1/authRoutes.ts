/**
 * Authentication routes - route definitions only.
 *
 * Paths are under /api/v1 (e.g. POST /api/v1/auth/admin/login).
 */

import { Router } from 'express';
import * as authController from '../../controllers/authController';

const router = Router();

router.post('/auth/admin/login', authController.adminLogin);

export { router as authRoutes };

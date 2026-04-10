/**
 * Legacy user routes — now proxied through adminRoutes.
 *
 * Kept for backward compatibility. New code should use /api/v1/admin/users.
 */

import { Router } from 'express';

const router = Router();
export { router as userRoutes };

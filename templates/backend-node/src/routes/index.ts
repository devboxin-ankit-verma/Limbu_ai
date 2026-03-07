/**
 * Route aggregator.
 * 
 * This module combines all route definitions.
 */

import { Router } from 'express';
import { userRoutes } from './v1/userRoutes';
import { authRoutes } from './v1/authRoutes';

const router = Router();

// API v1 routes
router.use('/v1', userRoutes);
router.use('/v1', authRoutes);

export { router as routes };

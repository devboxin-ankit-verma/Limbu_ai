/**
 * Authentication routes - route definitions only.
 * 
 * This module contains ONLY route definitions.
 * Controllers handle request/response.
 */

import { Router } from 'express';

const router = Router();

// TODO: Implement auth routes using AuthController
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - implement using AuthController' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - implement using AuthController' });
});

export { router as authRoutes };

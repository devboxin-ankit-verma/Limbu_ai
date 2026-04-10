/**
 * Authentication routes.
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh } from '../../controllers/authController';

const router = Router();

router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['provider', 'customer'])
      .withMessage('Role must be provider or customer'),
    body('email').optional().isEmail().withMessage('Enter a valid email'),
  ],
  register
);

router.post(
  '/auth/login',
  [
    body('identifier')
      .trim()
      .notEmpty()
      .withMessage('Phone number or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/auth/refresh', refresh);

export { router as authRoutes };

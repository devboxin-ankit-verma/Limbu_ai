/**
 * Customer routes — browse and booking.
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/authMiddleware';
import {
  browseProviders,
  createBooking,
  getBookingHistory,
  addReview,
} from '../../controllers/customerController';

const router = Router();

// Public browse
router.get('/customer/providers', browseProviders);

// Protected customer endpoints
router.post(
  '/customer/bookings',
  authenticate,
  [
    body('providerId').isInt({ min: 1 }).withMessage('Valid provider ID is required'),
    body('serviceId').isInt({ min: 1 }).withMessage('Valid service ID is required'),
    body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid ISO 8601 date'),
    body('paymentMethod')
      .optional()
      .isIn(['razorpay', 'upi', 'cod'])
      .withMessage('paymentMethod must be razorpay, upi or cod'),
  ],
  createBooking
);

router.get('/customer/bookings', authenticate, getBookingHistory);
router.post(
  '/customer/reviews',
  authenticate,
  [
    body('bookingId').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional({ nullable: true }).isString().isLength({ max: 1200 }),
  ],
  addReview
);

export { router as customerRoutes };

/**
 * Provider routes — protected, provider-role only.
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/authMiddleware';
import { requireProvider } from '../../middleware/adminMiddleware';
import { providerPhotoUpload, providerDocumentUpload } from '../../middleware/uploadMiddleware';
import {
  getMyProfile,
  getProviderById,
  setupProfile,
  createRegistrationOrder,
  getWalletHistory,
  getProviderReviews,
  completeRegistrationWithoutOnlinePayment,
  uploadProviderPhotos,
  getMyBookings,
  completeMyBooking,
  uploadProviderDocuments,
  updateIdentityVisibility,
} from '../../controllers/providerController';

const router = Router();

// Public: get any approved provider by ID
router.get('/providers/:id', getProviderById);
router.get('/providers/:id/reviews', getProviderReviews);

// Protected: provider-only endpoints
router.use('/providers', authenticate, requireProvider);

router.get('/providers/me/profile', getMyProfile);

router.post(
  '/providers/setup',
  authenticate,
  requireProvider,
  [
    body('bio').trim().notEmpty().withMessage('Bio is required'),
    body('expertise').isArray({ min: 1 }).withMessage('At least one expertise is required'),
    body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
    body('services.*.name').trim().notEmpty().withMessage('Service name is required'),
    body('services.*.imageUrl')
      .optional({ nullable: true })
      .isURL()
      .withMessage('Service image must be a valid URL'),
    body('services.*.price')
      .isFloat({ min: 1 })
      .withMessage('Service price must be a positive number'),
    body('services.*.durationMinutes')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
  ],
  setupProfile
);

router.post('/providers/pay-registration', authenticate, requireProvider, createRegistrationOrder);
router.post(
  '/providers/pay-registration/manual',
  authenticate,
  requireProvider,
  [body('paymentMethod').isIn(['cod', 'upi']).withMessage('paymentMethod must be cod or upi')],
  completeRegistrationWithoutOnlinePayment
);

router.post(
  '/providers/photos',
  authenticate,
  requireProvider,
  providerPhotoUpload.array('photos', 10),
  uploadProviderPhotos
);

// Document uploads — aadhaar and passport photo (never blurred)
router.post(
  '/providers/documents',
  authenticate,
  requireProvider,
  providerDocumentUpload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
  ]),
  uploadProviderDocuments
);

// Toggle profile image blur (identityHidden). Aadhaar is always fully visible.
router.patch(
  '/providers/me/identity',
  authenticate,
  requireProvider,
  [body('identityHidden').isBoolean().withMessage('identityHidden must be a boolean')],
  updateIdentityVisibility
);

router.get('/providers/me/wallet', authenticate, requireProvider, getWalletHistory);
router.get('/providers/me/bookings', authenticate, requireProvider, getMyBookings);
router.patch('/providers/me/bookings/:id/complete', authenticate, requireProvider, completeMyBooking);

export { router as providerRoutes };

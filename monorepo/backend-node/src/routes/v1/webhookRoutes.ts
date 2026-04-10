/**
 * Webhook routes — Razorpay event handling.
 *
 * Raw body must be preserved for HMAC signature verification.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { handleRazorpayWebhook } from '../../controllers/webhookController';

const router = Router();

// Capture raw body before JSON parsing for signature verification
router.post(
  '/webhooks/razorpay',
  (req: Request, _res: Response, next: NextFunction) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on('end', () => {
      (req as Request & { rawBody?: string }).rawBody = data;
      next();
    });
  },
  handleRazorpayWebhook
);

export { router as webhookRoutes };

/**
 * Webhook controller — handles incoming Razorpay webhook events.
 *
 * Uses raw body for signature verification (must be mounted before express.json()).
 */

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { StatusCodes } from '../constants/api';
import { ValidationError } from '../utils/errors';

function getPaymentService(req: Request): PaymentService {
  return req.app.get('paymentService');
}

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) throw new ValidationError('Missing webhook signature');

    const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);
    const paymentService = getPaymentService(req);

    const valid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!valid) throw new ValidationError('Invalid webhook signature');

    await paymentService.handleWebhookEvent(req.body);
    res.status(StatusCodes.OK).json({ received: true });
  } catch (err) {
    next(err);
  }
};

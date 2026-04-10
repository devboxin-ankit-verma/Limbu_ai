/**
 * Central dependency accessors.
 *
 * Convenience helpers that retrieve services from the Express app.
 * Used by controllers to avoid direct req.app.get() calls.
 */

import { Request } from 'express';
import { AuthService } from '../services/authService';
import { ProviderService } from '../services/providerService';
import { AdminService } from '../services/adminService';
import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';

export const getAuthService = (req: Request): AuthService => req.app.get('authService');
export const getProviderService = (req: Request): ProviderService => req.app.get('providerService');
export const getAdminService = (req: Request): AdminService => req.app.get('adminService');
export const getBookingService = (req: Request): BookingService => req.app.get('bookingService');
export const getPaymentService = (req: Request): PaymentService => req.app.get('paymentService');

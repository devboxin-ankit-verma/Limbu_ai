/**
 * Register all app-scoped dependencies on the Express app.
 *
 * Services are constructed once at startup and made available
 * to controllers via req.app.get('serviceName').
 */

import { Express } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { ProviderRepository } from '../repositories/providerRepository';
import { MassageServiceRepository } from '../repositories/serviceRepository';
import { BookingRepository } from '../repositories/bookingRepository';
import { PaymentRepository } from '../repositories/paymentRepository';
import { AccountSettingRepository } from '../repositories/accountSettingRepository';
import { ReviewRepository } from '../repositories/reviewRepository';
import { AuthService } from '../services/authService';
import { ProviderService } from '../services/providerService';
import { AdminService } from '../services/adminService';
import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';

export function registerRepositories(app: Express): void {
  const userRepo = new UserRepository();
  const providerRepo = new ProviderRepository();
  const serviceRepo = new MassageServiceRepository();
  const bookingRepo = new BookingRepository();
  const paymentRepo = new PaymentRepository();
  const accountSettingRepo = new AccountSettingRepository();
  const reviewRepo = new ReviewRepository();

  app.set('authService', new AuthService(userRepo, providerRepo, paymentRepo));
  app.set('providerService', new ProviderService(providerRepo, serviceRepo, paymentRepo, reviewRepo, accountSettingRepo));
  app.set(
    'adminService',
    new AdminService(providerRepo, userRepo, bookingRepo, paymentRepo, accountSettingRepo)
  );
  app.set(
    'bookingService',
    new BookingService(bookingRepo, providerRepo, serviceRepo, paymentRepo, reviewRepo)
  );
  app.set('paymentService', new PaymentService(paymentRepo, providerRepo, bookingRepo));
}

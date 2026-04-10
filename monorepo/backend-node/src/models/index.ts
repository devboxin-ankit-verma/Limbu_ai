/**
 * Model initialization and association wiring.
 *
 * Call initModels(sequelize) once at startup.
 * All models and associations are set up here.
 */

import { Sequelize } from 'sequelize';
import { initUserModel, UserModel } from './UserModel';
import { initProviderModel, ProviderModel } from './ProviderModel';
import { initMassageServiceModel, MassageServiceModel } from './ServiceModel';
import { initBookingModel, BookingModel } from './BookingModel';
import { initPaymentModel, PaymentModel } from './PaymentModel';
import { initWalletTxnModel, WalletTxnModel } from './WalletTxnModel';
import { initReviewModel, ReviewModel } from './ReviewModel';
import { initAccountSettingModel, AccountSettingModel } from './AccountSettingModel';

export function initModels(sequelize: Sequelize): void {
  initUserModel(sequelize);
  initProviderModel(sequelize);
  initMassageServiceModel(sequelize);
  initBookingModel(sequelize);
  initPaymentModel(sequelize);
  initWalletTxnModel(sequelize);
  initReviewModel(sequelize);
  initAccountSettingModel(sequelize);

  // User ↔ Provider (one-to-one)
  UserModel.hasOne(ProviderModel, { foreignKey: 'userId', as: 'provider' });
  ProviderModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

  // Provider ↔ MassageService (one-to-many)
  ProviderModel.hasMany(MassageServiceModel, { foreignKey: 'providerId', as: 'services' });
  MassageServiceModel.belongsTo(ProviderModel, { foreignKey: 'providerId', as: 'provider' });

  // Provider ↔ Booking (one-to-many)
  ProviderModel.hasMany(BookingModel, { foreignKey: 'providerId', as: 'bookings' });
  BookingModel.belongsTo(ProviderModel, { foreignKey: 'providerId', as: 'provider' });

  // User (customer) ↔ Booking (one-to-many)
  UserModel.hasMany(BookingModel, { foreignKey: 'customerId', as: 'bookings' });
  BookingModel.belongsTo(UserModel, { foreignKey: 'customerId', as: 'customer' });

  // MassageService ↔ Booking (one-to-many)
  MassageServiceModel.hasMany(BookingModel, { foreignKey: 'serviceId', as: 'bookings' });
  BookingModel.belongsTo(MassageServiceModel, { foreignKey: 'serviceId', as: 'service' });

  // User ↔ Payment (one-to-many)
  UserModel.hasMany(PaymentModel, { foreignKey: 'userId', as: 'payments' });
  PaymentModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

  // Provider ↔ WalletTxn (one-to-many)
  ProviderModel.hasMany(WalletTxnModel, { foreignKey: 'providerId', as: 'walletTxns' });
  WalletTxnModel.belongsTo(ProviderModel, { foreignKey: 'providerId', as: 'provider' });

  // Booking ↔ WalletTxn (one-to-many)
  BookingModel.hasMany(WalletTxnModel, { foreignKey: 'bookingId', as: 'walletTxns' });
  WalletTxnModel.belongsTo(BookingModel, { foreignKey: 'bookingId', as: 'booking' });

  // Booking ↔ Review (one-to-one)
  BookingModel.hasOne(ReviewModel, { foreignKey: 'bookingId', as: 'review' });
  ReviewModel.belongsTo(BookingModel, { foreignKey: 'bookingId', as: 'booking' });

  // Provider ↔ Review (one-to-many)
  ProviderModel.hasMany(ReviewModel, { foreignKey: 'providerId', as: 'reviews' });
  ReviewModel.belongsTo(ProviderModel, { foreignKey: 'providerId', as: 'provider' });

  // User(customer) ↔ Review (one-to-many)
  UserModel.hasMany(ReviewModel, { foreignKey: 'customerId', as: 'reviews' });
  ReviewModel.belongsTo(UserModel, { foreignKey: 'customerId', as: 'customer' });
}

export {
  UserModel,
  ProviderModel,
  MassageServiceModel,
  BookingModel,
  PaymentModel,
  WalletTxnModel,
  ReviewModel,
  AccountSettingModel,
};

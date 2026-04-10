/// API endpoint constants.
///
/// All backend endpoint paths live here.
abstract class ApiConstants {
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';

  static const String providerSetup = '/providers/setup';
  static const String providerPayRegistration = '/providers/pay-registration';
  static const String providerPayRegistrationManual = '/providers/pay-registration/manual';
  static const String providerPhotos = '/providers/photos';
  static const String providerMeProfile = '/providers/me/profile';
  static const String providerMeWallet = '/providers/me/wallet';
  static const String providerMeBookings = '/providers/me/bookings';
  static String providerCompleteBooking(int id) => '/providers/me/bookings/$id/complete';
  static String providerById(int id) => '/providers/$id';

  static const String customerProviders = '/customer/providers';
  static const String customerBookings = '/customer/bookings';

  static const String adminDashboard = '/admin/dashboard';
  static const String adminProviders = '/admin/providers';
  static String adminApproveProvider(int id) => '/admin/providers/$id/approve';
  static String adminRejectProvider(int id) => '/admin/providers/$id/reject';
  static const String adminUsers = '/admin/users';
  static const String adminBookings = '/admin/bookings';
  static const String adminPayments = '/admin/payments';
}

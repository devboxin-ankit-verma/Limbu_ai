/// Application-wide constants.
///
/// No hardcoded values anywhere else in the codebase.
abstract class AppConstants {
  // Environment variable keys
  static const String envApiBaseUrl = 'API_BASE_URL';
  static const String envAppEnv = 'APP_ENV';
  static const String envAppName = 'APP_NAME';
  static const String envAppVersion = 'APP_VERSION';
  static const String envRazorpayKeyId = 'RAZORPAY_KEY_ID';

  // .env file name
  static const String envFileName = '.env';

  // App metadata
  static const String appName = 'Desi Dai Massage';
  static const String appTagline = 'पीढ़ी दर पीढ़ी अटूट विश्वास की परंपरा।';

  // Route paths
  static const String routeSplash = '/';
  static const String routeOnboarding = '/onboarding';
  static const String routeLogin = '/login';
  static const String routeRegister = '/register';
  static const String routeAbout = '/about';

  // Provider routes
  static const String routeProviderSetup = '/provider/setup';
  static const String routeProviderPayment = '/provider/payment';
  static const String routeProviderHome = '/provider/home';
  static const String routeProviderDashboard = '/provider/dashboard';
  static const String routeProviderWallet = '/provider/wallet';

  // Customer routes
  static const String routeCustomerHome = '/customer/home';
  static const String routeCustomerBookings = '/customer/bookings';
  static const String routeBookingDetail = '/booking/:id';

  // Local storage keys
  static const String storageAccessToken = 'access_token';
  static const String storageRefreshToken = 'refresh_token';
  static const String storageUserId = 'user_id';
  static const String storageUserRole = 'user_role';
  static const String storageUserName = 'user_name';
}

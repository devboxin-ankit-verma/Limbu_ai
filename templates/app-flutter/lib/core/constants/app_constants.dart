/// Application-wide constants.
///
/// No hardcoded values anywhere else in the codebase.
/// All string keys, route paths, and storage keys live here.
abstract class AppConstants {
  // Environment variable keys
  static const String envApiBaseUrl = 'API_BASE_URL';
  static const String envAppEnv = 'APP_ENV';
  static const String envAppName = 'APP_NAME';
  static const String envAppVersion = 'APP_VERSION';

  // .env file name
  static const String envFileName = '.env';

  // Route paths
  static const String routeHome = '/';
  static const String routeLogin = '/login';

  // Local storage keys
  static const String storageAuthToken = 'auth_token';
  static const String storageUser = 'user';
}

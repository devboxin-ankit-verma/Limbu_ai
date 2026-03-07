/// API endpoint and timeout constants.
///
/// All API-related constants. No hardcoded values in services or repositories.
/// Organized by resource domain.
abstract class ApiConstants {
  // Auth endpoints
  static const String authLogin = '/auth/login';
  static const String authLogout = '/auth/logout';
  static const String authRefresh = '/auth/refresh';

  // User endpoints
  static const String users = '/users';
  static const String userById = '/users/{id}';

  // Timeouts (milliseconds)
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;
}

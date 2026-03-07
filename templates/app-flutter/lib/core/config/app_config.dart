/// Application configuration.
///
/// Loads and validates all environment variables.
/// NEVER access dotenv.env directly — always use this class.
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../constants/app_constants.dart';

abstract class AppConfig {
  static late String appName;
  static late String appVersion;
  static late String apiBaseUrl;
  static late String appEnv;

  /// Call once in main() after dotenv.load().
  static void initialize() {
    apiBaseUrl = _require(AppConstants.envApiBaseUrl);
    appEnv = _get(AppConstants.envAppEnv, defaultValue: 'development');
    appName = _get(AppConstants.envAppName, defaultValue: 'Flutter App');
    appVersion = _get(AppConstants.envAppVersion, defaultValue: '1.0.0');
  }

  static bool get isProduction => appEnv == 'production';
  static bool get isDevelopment => appEnv == 'development';
  static bool get isDebug => appEnv != 'production';

  static String _require(String key) {
    final value = dotenv.env[key];
    if (value == null || value.isEmpty) {
      throw Exception('Missing required environment variable: $key');
    }
    return value;
  }

  static String _get(String key, {required String defaultValue}) {
    return dotenv.env[key] ?? defaultValue;
  }
}

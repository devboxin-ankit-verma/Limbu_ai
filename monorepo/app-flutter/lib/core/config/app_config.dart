/// Application configuration loaded from environment variables.
///
/// Always access config through this class — never read dotenv directly.
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../constants/app_constants.dart';

abstract class AppConfig {
  static late String apiBaseUrl;
  static late String appEnv;
  static late String appName;
  static late String appVersion;
  static late String razorpayKeyId;

  static void initialize() {
    apiBaseUrl = dotenv.env[AppConstants.envApiBaseUrl] ?? 'http://localhost:8000/api/v1';
    appEnv = dotenv.env[AppConstants.envAppEnv] ?? 'development';
    appName = dotenv.env[AppConstants.envAppName] ?? AppConstants.appName;
    appVersion = dotenv.env[AppConstants.envAppVersion] ?? '1.0.0';
    razorpayKeyId = dotenv.env[AppConstants.envRazorpayKeyId] ?? '';
  }
}

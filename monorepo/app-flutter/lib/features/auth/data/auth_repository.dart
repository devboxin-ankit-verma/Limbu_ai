/// Auth repository — API calls and local token storage.
///
/// Data access only. No business logic.
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../domain/auth_entity.dart';
import 'auth_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final _log = Logger('AuthRepository');

  AuthRepository(this._apiClient);

  Future<AuthEntity> register({
    required String name,
    required String phone,
    String? email,
    required String password,
    required String role,
    int? age,
    String? gender,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.authRegister,
        data: {
          'name': name,
          'phone': phone,
          if (email != null) 'email': email,
          'password': password,
          'role': role,
          if (age != null) 'age': age,
          if (gender != null) 'gender': gender,
        },
      );
      final entity = AuthModel.fromJson(response.data!).toEntity();
      await _saveTokens(entity);
      return entity;
    } catch (e, st) {
      _log.error('register failed', e, st);
      rethrow;
    }
  }

  Future<AuthEntity> login({
    required String identifier, // phone number or email
    required String password,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.authLogin,
        data: {'identifier': identifier, 'password': password},
      );
      final entity = AuthModel.fromJson(response.data!).toEntity();
      await _saveTokens(entity);
      return entity;
    } catch (e, st) {
      _log.error('login failed', e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.storageAccessToken);
    await prefs.remove(AppConstants.storageRefreshToken);
    await prefs.remove(AppConstants.storageUserId);
    await prefs.remove(AppConstants.storageUserRole);
    await prefs.remove(AppConstants.storageUserName);
  }

  Future<AuthEntity?> getStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.storageAccessToken);
    final refreshToken = prefs.getString(AppConstants.storageRefreshToken);
    final userId = prefs.getInt(AppConstants.storageUserId);
    final role = prefs.getString(AppConstants.storageUserRole);
    if (token == null || userId == null || role == null) return null;
    return AuthEntity(
      accessToken: token,
      refreshToken: refreshToken ?? '',
      userId: userId,
      role: role,
    );
  }

  Future<void> _saveTokens(AuthEntity entity) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.storageAccessToken, entity.accessToken);
    await prefs.setString(AppConstants.storageRefreshToken, entity.refreshToken);
    await prefs.setInt(AppConstants.storageUserId, entity.userId);
    await prefs.setString(AppConstants.storageUserRole, entity.role);
  }
}

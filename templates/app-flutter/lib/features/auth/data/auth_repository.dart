/// Auth repository.
///
/// Data access for authentication: API calls only.
/// NO business logic. Maps raw API responses to domain entities.
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../domain/auth_entity.dart';
import 'auth_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final _log = Logger('AuthRepository');

  AuthRepository(this._apiClient);

  Future<AuthEntity> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.authLogin,
        data: {'email': email, 'password': password},
      );
      return AuthModel.fromJson(response.data!).toEntity();
    } catch (e, st) {
      _log.error('login failed', e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post<void>(ApiConstants.authLogout);
    } catch (e, st) {
      _log.error('logout failed', e, st);
      rethrow;
    }
  }
}

/// Auth state management using Riverpod.
///
/// Exposes AuthNotifier which handles login, register, logout, and restore.
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/auth_repository.dart';
import '../domain/auth_entity.dart';

class AuthState {
  final AuthEntity? entity;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.entity,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => entity != null;
  String? get role => entity?.role;

  AuthState copyWith({
    AuthEntity? entity,
    bool? isLoading,
    String? error,
  }) =>
      AuthState(
        entity: entity ?? this.entity,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  AuthState withLoading() => AuthState(entity: entity, isLoading: true);
  AuthState withError(String msg) => AuthState(entity: entity, error: msg);
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ApiClient());
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState()) {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      final stored = await _repo.getStoredAuth();
      if (stored != null) {
        state = AuthState(entity: stored);
      }
    } catch (_) {}
  }

  Future<bool> register({
    required String name,
    required String phone,
    String? email,
    required String password,
    required String role,
    int? age,
    String? gender,
    String? providerCode,
  }) async {
    state = state.withLoading();
    try {
      final entity = await _repo.register(
        name: name,
        phone: phone,
        email: email,
        password: password,
        role: role,
        age: age,
        gender: gender,
        providerCode: providerCode,
      );
      state = AuthState(entity: entity);
      return true;
    } catch (e) {
      state = state.withError(_parseError(e));
      return false;
    }
  }

  Future<void> login({required String identifier, required String password}) async {
    state = state.withLoading();
    try {
      final entity = await _repo.login(identifier: identifier, password: password);
      state = AuthState(entity: entity);
    } catch (e) {
      state = state.withError(_parseError(e));
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState();
  }

  String _parseError(Object e) {
    // Extract actual API error message from Dio response
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map) {
        final apiMsg = data['error'] as String? ?? data['message'] as String?;
        if (apiMsg != null && apiMsg.isNotEmpty) {
          // Map known backend messages to user-friendly text
          if (apiMsg.contains('phone already exists') || apiMsg.contains('already exists')) {
            return 'This phone number is already registered. Please sign in.';
          }
          if (apiMsg.contains('Invalid credentials') || apiMsg.contains('Invalid phone')) {
            return 'Incorrect phone number or password.';
          }
          // Return the actual API message for anything else
          return apiMsg;
        }
      }
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        return 'Cannot connect to server. Check your internet connection.';
      }
    }
    final msg = e.toString();
    if (msg.contains('SocketException') || msg.contains('Connection')) {
      return 'No internet connection. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}

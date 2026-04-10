/// Auth API response model.
///
/// Maps raw JSON to domain entity.
import '../domain/auth_entity.dart';

class AuthModel {
  final String accessToken;
  final String refreshToken;
  final int userId;
  final String role;

  const AuthModel({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.role,
  });

  factory AuthModel.fromJson(Map<String, dynamic> json) => AuthModel(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
        userId: json['userId'] as int,
        role: json['role'] as String,
      );

  AuthEntity toEntity() => AuthEntity(
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: userId,
        role: role,
      );
}

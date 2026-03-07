/// Auth model.
///
/// Data-layer model for auth API responses. Handles JSON serialization.
/// Only used in the data layer — domain code uses AuthEntity.
import '../domain/auth_entity.dart';

class AuthModel {
  final String id;
  final String email;
  final String name;
  final String accessToken;

  const AuthModel({
    required this.id,
    required this.email,
    required this.name,
    required this.accessToken,
  });

  factory AuthModel.fromJson(Map<String, dynamic> json) {
    return AuthModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      accessToken: json['access_token'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'access_token': accessToken,
    };
  }

  AuthEntity toEntity() {
    return AuthEntity(
      id: id,
      email: email,
      name: name,
      accessToken: accessToken,
    );
  }
}

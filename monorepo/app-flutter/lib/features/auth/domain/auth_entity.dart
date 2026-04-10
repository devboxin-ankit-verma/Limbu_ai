/// Auth domain entity.
///
/// Pure Dart — no framework dependencies.
class AuthEntity {
  final String accessToken;
  final String refreshToken;
  final int userId;
  final String role;

  const AuthEntity({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.role,
  });

  bool get isProvider => role == 'provider';
  bool get isCustomer => role == 'customer';
  bool get isAdmin => role == 'admin';
}

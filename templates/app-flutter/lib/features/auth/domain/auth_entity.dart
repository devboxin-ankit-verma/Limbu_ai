/// Auth entity.
///
/// Core domain model for an authenticated user.
/// No framework dependencies. No JSON or database logic — that lives in data/.
class AuthEntity {
  final String id;
  final String email;
  final String name;
  final String accessToken;

  const AuthEntity({
    required this.id,
    required this.email,
    required this.name,
    required this.accessToken,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthEntity &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'AuthEntity(id: $id, email: $email, name: $name)';
}

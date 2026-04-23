/// Provider API response model.
import '../domain/provider_entity.dart';

class ServiceModel {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int durationMinutes;

  const ServiceModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) => ServiceModel(
        id: _asInt(json['id']),
        name: (json['name'] ?? '') as String,
        description: json['description'] as String?,
        price: _asDouble(json['price']),
        durationMinutes: _asInt(json['durationMinutes']),
      );

  ServiceEntity toEntity() => ServiceEntity(
        id: id,
        name: name,
        description: description,
        price: price,
        durationMinutes: durationMinutes,
      );
}

class ProviderModel {
  final int id;
  final int userId;
  final String? bio;
  final List<String> photos;
  final List<String> expertise;
  final String status;
  final double walletBalance;
  final String? registrationFeePaidAt;
  final String? userName;
  final String? userPhone;
  final bool hideIdentity;
  final List<ServiceModel> services;

  const ProviderModel({
    required this.id,
    required this.userId,
    this.bio,
    required this.photos,
    required this.expertise,
    required this.status,
    required this.walletBalance,
    this.registrationFeePaidAt,
    this.userName,
    this.userPhone,
    this.hideIdentity = false,
    required this.services,
  });

  factory ProviderModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final servicesList = (json['services'] as List<dynamic>?)
            ?.map((s) => ServiceModel.fromJson(s as Map<String, dynamic>))
            .toList() ??
        [];
    return ProviderModel(
      id: _asInt(json['id']),
      userId: _asInt(json['userId']),
      bio: json['bio'] as String?,
      photos: List<String>.from(json['photos'] as List? ?? []),
      expertise: List<String>.from(json['expertise'] as List? ?? []),
      status: json['status'] as String,
      walletBalance: _asDouble(json['walletBalance']),
      registrationFeePaidAt: json['registrationFeePaidAt'] as String?,
      userName: user?['name'] as String?,
      userPhone: user?['phone'] as String?,
      hideIdentity: user?['hideIdentity'] as bool? ?? false,
      services: servicesList,
    );
  }

  ProviderEntity toEntity() => ProviderEntity(
        id: id,
        userId: userId,
        bio: bio,
        photos: photos,
        expertise: expertise,
        status: status,
        walletBalance: walletBalance,
        registrationFeePaidAt: registrationFeePaidAt != null
            ? DateTime.parse(registrationFeePaidAt!)
            : null,
        userName: userName,
        userPhone: userPhone,
        hideIdentity: hideIdentity,
        services: services.map((s) => s.toEntity()).toList(),
      );
}

int _asInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

double _asDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

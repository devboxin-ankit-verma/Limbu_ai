/// Provider domain entities — pure Dart.
class ServiceEntity {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int durationMinutes;

  const ServiceEntity({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
  });
}

class ProviderEntity {
  final int id;
  final int userId;
  final String? bio;
  final List<String> photos;
  final List<String> expertise;
  final String status;
  final double walletBalance;
  final DateTime? registrationFeePaidAt;
  final String? userName;
  final String? userPhone;
  final List<ServiceEntity> services;

  const ProviderEntity({
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
    required this.services,
  });

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  bool get hasProfileSetup => bio != null && bio!.isNotEmpty && services.isNotEmpty;
  bool get hasFeePaid => registrationFeePaidAt != null;
}

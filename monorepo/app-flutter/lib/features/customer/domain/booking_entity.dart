/// Booking domain entity — pure Dart.
class BookingEntity {
  final int id;
  final int customerId;
  final int providerId;
  final int serviceId;
  final DateTime scheduledAt;
  final String status;
  final double amount;
  final String? providerName;
  final String? serviceName;
  final String? customerName;
  final DateTime createdAt;

  const BookingEntity({
    required this.id,
    required this.customerId,
    required this.providerId,
    required this.serviceId,
    required this.scheduledAt,
    required this.status,
    required this.amount,
    this.providerName,
    this.serviceName,
    this.customerName,
    required this.createdAt,
  });

  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
}

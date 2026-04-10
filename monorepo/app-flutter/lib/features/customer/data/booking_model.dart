/// Booking API response model.
import '../domain/booking_entity.dart';

class BookingModel {
  final int id;
  final int customerId;
  final int providerId;
  final int serviceId;
  final String scheduledAt;
  final String status;
  final double amount;
  final String? providerName;
  final String? serviceName;
  final String? customerName;
  final String createdAt;

  const BookingModel({
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

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final provider = json['provider'] as Map<String, dynamic>?;
    final providerUser = provider?['user'] as Map<String, dynamic>?;
    final customer = json['customer'] as Map<String, dynamic>?;
    final service = json['service'] as Map<String, dynamic>?;
    final rawAmount = json['amount'];

    return BookingModel(
      id: json['id'] as int,
      customerId: json['customerId'] as int,
      providerId: json['providerId'] as int,
      serviceId: json['serviceId'] as int,
      scheduledAt: json['scheduledAt'] as String,
      status: json['status'] as String,
      amount: rawAmount is num
          ? rawAmount.toDouble()
          : double.tryParse(rawAmount.toString()) ?? 0.0,
      providerName: providerUser?['name'] as String?,
      serviceName: service?['name'] as String?,
      customerName: customer?['name'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }

  BookingEntity toEntity() => BookingEntity(
        id: id,
        customerId: customerId,
        providerId: providerId,
        serviceId: serviceId,
        scheduledAt: DateTime.parse(scheduledAt),
        status: status,
        amount: amount,
        providerName: providerName,
        serviceName: serviceName,
        customerName: customerName,
        createdAt: DateTime.parse(createdAt),
      );
}

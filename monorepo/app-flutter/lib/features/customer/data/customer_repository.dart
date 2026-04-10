/// Customer repository — browse providers and manage bookings.
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../../provider/data/provider_model.dart';
import '../../provider/domain/provider_entity.dart';
import '../domain/booking_entity.dart';
import 'booking_model.dart';

class CustomerRepository {
  final ApiClient _apiClient;
  final _log = Logger('CustomerRepository');

  CustomerRepository(this._apiClient);

  Future<List<ProviderEntity>> browseProviders({
    int offset = 0,
    int limit = 20,
  }) async {
    try {
      final res = await _apiClient.get<List<dynamic>>(
        ApiConstants.customerProviders,
        queryParameters: {'offset': offset, 'limit': limit},
      );
      return (res.data as List)
          .map((p) => ProviderModel.fromJson(p as Map<String, dynamic>).toEntity())
          .toList();
    } catch (e, st) {
      _log.error('browseProviders failed', e, st);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createBooking({
    required int providerId,
    required int serviceId,
    required DateTime scheduledAt,
    required String paymentMethod,
  }) async {
    try {
      final res = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.customerBookings,
        data: {
          'providerId': providerId,
          'serviceId': serviceId,
          'scheduledAt': scheduledAt.toIso8601String(),
          'paymentMethod': paymentMethod,
        },
      );
      return res.data!;
    } catch (e, st) {
      _log.error('createBooking failed', e, st);
      rethrow;
    }
  }

  Future<List<BookingEntity>> getBookingHistory({
    int offset = 0,
    int limit = 20,
  }) async {
    try {
      final res = await _apiClient.get<List<dynamic>>(
        ApiConstants.customerBookings,
        queryParameters: {'offset': offset, 'limit': limit},
      );
      return (res.data as List)
          .map((b) => BookingModel.fromJson(b as Map<String, dynamic>).toEntity())
          .toList();
    } catch (e, st) {
      _log.error('getBookingHistory failed', e, st);
      rethrow;
    }
  }
}

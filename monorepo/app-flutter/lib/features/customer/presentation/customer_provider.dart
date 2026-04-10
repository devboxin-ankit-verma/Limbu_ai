/// Customer state management.
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../provider/domain/provider_entity.dart';
import '../data/customer_repository.dart';
import '../domain/booking_entity.dart';

class CustomerState {
  final List<ProviderEntity> providers;
  final List<BookingEntity> bookings;
  final bool isLoading;
  final String? error;

  const CustomerState({
    this.providers = const [],
    this.bookings = const [],
    this.isLoading = false,
    this.error,
  });

  CustomerState copyWith({
    List<ProviderEntity>? providers,
    List<BookingEntity>? bookings,
    bool? isLoading,
    String? error,
  }) =>
      CustomerState(
        providers: providers ?? this.providers,
        bookings: bookings ?? this.bookings,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  return CustomerRepository(ApiClient());
});

final customerStateProvider =
    StateNotifierProvider<CustomerNotifier, CustomerState>((ref) {
  return CustomerNotifier(ref.read(customerRepositoryProvider));
});

class CustomerNotifier extends StateNotifier<CustomerState> {
  final CustomerRepository _repo;

  CustomerNotifier(this._repo) : super(const CustomerState());

  Future<void> loadProviders() async {
    state = state.copyWith(isLoading: true);
    try {
      final providers = await _repo.browseProviders();
      state = state.copyWith(providers: providers, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Map<String, dynamic>?> createBooking({
    required int providerId,
    required int serviceId,
    required DateTime scheduledAt,
    required String paymentMethod,
  }) async {
    try {
      return await _repo.createBooking(
        providerId: providerId,
        serviceId: serviceId,
        scheduledAt: scheduledAt,
        paymentMethod: paymentMethod,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<void> loadBookings() async {
    state = state.copyWith(isLoading: true);
    try {
      final bookings = await _repo.getBookingHistory();
      state = state.copyWith(bookings: bookings, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

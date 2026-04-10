/// Provider state management using Riverpod.
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../customer/domain/booking_entity.dart';
import '../data/provider_repository.dart';
import '../domain/provider_entity.dart';

class ProviderState {
  final ProviderEntity? provider;
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? walletData;
  final List<BookingEntity> bookings;

  const ProviderState({
    this.provider,
    this.isLoading = false,
    this.error,
    this.walletData,
    this.bookings = const [],
  });

  ProviderState copyWith({
    ProviderEntity? provider,
    bool? isLoading,
    String? error,
    Map<String, dynamic>? walletData,
    List<BookingEntity>? bookings,
  }) =>
      ProviderState(
        provider: provider ?? this.provider,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        walletData: walletData ?? this.walletData,
        bookings: bookings ?? this.bookings,
      );
}

final providerRepositoryProvider = Provider<ProviderRepository>((ref) {
  return ProviderRepository(ApiClient());
});

final providerStateProvider =
    StateNotifierProvider<ProviderNotifier, ProviderState>((ref) {
  return ProviderNotifier(ref.read(providerRepositoryProvider));
});

class ProviderNotifier extends StateNotifier<ProviderState> {
  final ProviderRepository _repo;

  ProviderNotifier(this._repo) : super(const ProviderState());

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true);
    try {
      final provider = await _repo.getMyProfile();
      state = state.copyWith(provider: provider, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> setupProfile({
    required String bio,
    required List<String> photos,
    required List<String> expertise,
    required List<Map<String, dynamic>> services,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      final provider = await _repo.setupProfile(
        bio: bio,
        photos: photos,
        expertise: expertise,
        services: services,
      );
      state = state.copyWith(provider: provider, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<RazorpayOrder?> createRegistrationOrder() async {
    try {
      return await _repo.createRegistrationOrder();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<bool> completeRegistrationWithManualMethod(String paymentMethod) async {
    state = state.copyWith(isLoading: true);
    try {
      await _repo.completeRegistrationWithManualMethod(paymentMethod: paymentMethod);
      await loadProfile();
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> loadWallet() async {
    state = state.copyWith(isLoading: true);
    try {
      final data = await _repo.getWalletHistory();
      state = state.copyWith(walletData: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> addService(Map<String, dynamic> service) async {
    final p = state.provider;
    if (p == null) return false;
    final services = [
      ...p.services.map(_serviceToMap),
      service,
    ];
    return _updateServices(p, services);
  }

  Future<bool> updateService(int index, Map<String, dynamic> service) async {
    final p = state.provider;
    if (p == null || index < 0 || index >= p.services.length) return false;
    final services = p.services.map(_serviceToMap).toList();
    services[index] = service;
    return _updateServices(p, services);
  }

  Future<bool> removeService(int index) async {
    final p = state.provider;
    if (p == null || index < 0 || index >= p.services.length) return false;
    final services = p.services.map(_serviceToMap).toList()..removeAt(index);
    return _updateServices(p, services);
  }

  Future<bool> _updateServices(
      ProviderEntity p, List<Map<String, dynamic>> services) async {
    state = state.copyWith(isLoading: true);
    try {
      final updated = await _repo.setupProfile(
        bio: p.bio ?? '',
        photos: p.photos,
        expertise: p.expertise,
        services: services,
      );
      state = state.copyWith(provider: updated, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> loadMyBookings() async {
    try {
      final bookings = await _repo.getMyBookings();
      state = state.copyWith(bookings: bookings);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<bool> completeBooking(int bookingId) async {
    try {
      final updated = await _repo.completeBooking(bookingId);
      final updatedList = state.bookings
          .map((b) => b.id == bookingId ? updated : b)
          .toList();
      state = state.copyWith(bookings: updatedList);
      // Reload profile to get updated wallet balance
      await loadProfile();
      await loadWallet();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Map<String, dynamic> _serviceToMap(ServiceEntity s) => {
        'name': s.name,
        'description': s.description ?? '',
        'price': s.price,
        'durationMinutes': s.durationMinutes,
      };
}

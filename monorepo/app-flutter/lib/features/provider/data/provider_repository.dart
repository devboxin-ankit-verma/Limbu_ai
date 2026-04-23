/// Provider repository — API calls for provider endpoints.
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../customer/data/booking_model.dart';
import '../../customer/domain/booking_entity.dart';
import '../domain/provider_entity.dart';
import 'provider_model.dart';

class RazorpayOrder {
  final String orderId;
  final int amount;
  final String currency;

  const RazorpayOrder({
    required this.orderId,
    required this.amount,
    required this.currency,
  });

  factory RazorpayOrder.fromJson(Map<String, dynamic> json) => RazorpayOrder(
        orderId: json['orderId'] as String,
        amount: json['amount'] as int,
        currency: json['currency'] as String,
      );
}

class ProviderRepository {
  final ApiClient _apiClient;
  final _log = Logger('ProviderRepository');

  ProviderRepository(this._apiClient);

  Future<ProviderEntity> getMyProfile() async {
    try {
      final res =
          await _apiClient.get<Map<String, dynamic>>(ApiConstants.providerMeProfile);
      return ProviderModel.fromJson(res.data!).toEntity();
    } catch (e, st) {
      _log.error('getMyProfile failed', e, st);
      rethrow;
    }
  }

  Future<ProviderEntity> setupProfile({
    required String bio,
    required List<String> photos,
    required List<String> expertise,
    required List<Map<String, dynamic>> services,
  }) async {
    try {
      final res = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.providerSetup,
        data: {
          'bio': bio,
          'photos': photos,
          'expertise': expertise,
          'services': services,
        },
      );
      return ProviderModel.fromJson(res.data!).toEntity();
    } catch (e, st) {
      _log.error('setupProfile failed', e, st);
      rethrow;
    }
  }

  Future<RazorpayOrder> createRegistrationOrder() async {
    try {
      final res = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.providerPayRegistration,
      );
      return RazorpayOrder.fromJson(res.data!);
    } catch (e, st) {
      _log.error('createRegistrationOrder failed', e, st);
      rethrow;
    }
  }

  Future<void> completeRegistrationWithManualMethod({
    required String paymentMethod,
  }) async {
    try {
      await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.providerPayRegistrationManual,
        data: {'paymentMethod': paymentMethod},
      );
    } catch (e, st) {
      _log.error('completeRegistrationWithManualMethod failed', e, st);
      rethrow;
    }
  }

  /// Uploads Aadhaar card and passport-size photograph.
  /// Returns a map with keys [aadhaarUrl] and [passportPhotoUrl].
  /// These are verification documents and are NEVER blurred.
  Future<Map<String, String>> uploadProviderDocuments({
    required XFile aadhaarFile,
    required XFile passportPhotoFile,
  }) async {
    try {
      final formData = FormData.fromMap({
        'aadhaar': await MultipartFile.fromFile(
          aadhaarFile.path,
          filename: aadhaarFile.name,
        ),
        'passportPhoto': await MultipartFile.fromFile(
          passportPhotoFile.path,
          filename: passportPhotoFile.name,
        ),
      });
      final res = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.providerDocuments,
        data: formData,
      );
      return {
        'aadhaarUrl': res.data?['aadhaarUrl'] as String? ?? '',
        'passportPhotoUrl': res.data?['passportPhotoUrl'] as String? ?? '',
      };
    } catch (e, st) {
      _log.error('uploadProviderDocuments failed', e, st);
      rethrow;
    }
  }

  /// Updates whether this provider's profile photo is blurred.
  /// Only the profile photo is affected — Aadhaar and other documents remain visible.
  Future<void> updateIdentityVisibility({required bool identityHidden}) async {
    try {
      await _apiClient.patch<Map<String, dynamic>>(
        ApiConstants.providerMeIdentity,
        data: {'identityHidden': identityHidden},
      );
    } catch (e, st) {
      _log.error('updateIdentityVisibility failed', e, st);
      rethrow;
    }
  }

  Future<List<String>> uploadProviderPhotos(List<XFile> photos) async {
    if (photos.isEmpty) return [];
    try {
      final files = <MultipartFile>[];
      for (final photo in photos) {
        files.add(
          await MultipartFile.fromFile(
            photo.path,
            filename: photo.name,
          ),
        );
      }
      final formData = FormData.fromMap({'photos': files});
      final res = await _apiClient.post<Map<String, dynamic>>(
        ApiConstants.providerPhotos,
        data: formData,
      );
      return List<String>.from((res.data?['photos'] as List?) ?? []);
    } catch (e, st) {
      _log.error('uploadProviderPhotos failed', e, st);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getWalletHistory() async {
    try {
      final res =
          await _apiClient.get<Map<String, dynamic>>(ApiConstants.providerMeWallet);
      return res.data!;
    } catch (e, st) {
      _log.error('getWalletHistory failed', e, st);
      rethrow;
    }
  }

  Future<List<BookingEntity>> getMyBookings({int offset = 0, int limit = 50}) async {
    try {
      final res = await _apiClient.get<List<dynamic>>(
        ApiConstants.providerMeBookings,
        queryParameters: {'offset': offset, 'limit': limit},
      );
      return (res.data as List)
          .map((b) => BookingModel.fromJson(b as Map<String, dynamic>).toEntity())
          .toList();
    } catch (e, st) {
      _log.error('getMyBookings failed', e, st);
      rethrow;
    }
  }

  Future<BookingEntity> completeBooking(int bookingId) async {
    try {
      final res = await _apiClient.patch<Map<String, dynamic>>(
        ApiConstants.providerCompleteBooking(bookingId),
      );
      return BookingModel.fromJson(res.data!).toEntity();
    } catch (e, st) {
      _log.error('completeBooking failed', e, st);
      rethrow;
    }
  }

  Future<ProviderEntity> getProviderById(int id) async {
    try {
      final res = await _apiClient
          .get<Map<String, dynamic>>(ApiConstants.providerById(id));
      return ProviderModel.fromJson(res.data!).toEntity();
    } catch (e, st) {
      _log.error('getProviderById failed', e, st);
      rethrow;
    }
  }
}

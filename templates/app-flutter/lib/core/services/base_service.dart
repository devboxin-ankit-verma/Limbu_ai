/// Base service.
///
/// Abstract base class for all services. Provides shared error handling
/// and response parsing utilities. All feature services must extend this.
import 'package:dio/dio.dart';

import '../utils/logger.dart';

abstract class BaseService {
  /// Parse a single-object API response into a typed model.
  T handleResponse<T>(
    Response<dynamic> response,
    T Function(Map<String, dynamic> data) fromJson,
  ) {
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return fromJson(data);
    }
    throw const FormatException('Unexpected response format');
  }

  /// Parse a list API response into a list of typed models.
  List<T> handleListResponse<T>(
    Response<dynamic> response,
    T Function(Map<String, dynamic> data) fromJson,
  ) {
    final data = response.data;
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().map(fromJson).toList();
    }
    throw const FormatException('Unexpected list response format');
  }

  /// Wrap any async call with standardized error logging and rethrow.
  Future<T> safeCall<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on DioException catch (e) {
      logger.error('Service error: ${e.message}', e);
      rethrow;
    } catch (e, st) {
      logger.error('Unexpected error', e, st);
      rethrow;
    }
  }
}

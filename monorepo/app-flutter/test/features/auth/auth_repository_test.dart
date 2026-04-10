import 'package:app_flutter/core/network/api_client.dart';
import 'package:app_flutter/features/auth/data/auth_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late AuthRepository repository;
  late MockApiClient mockApiClient;

  setUp(() {
    mockApiClient = MockApiClient();
    repository = AuthRepository(mockApiClient);
  });

  group('AuthRepository', () {
    test('login returns AuthEntity on success', () async {
      when(
        () => mockApiClient.post<Map<String, dynamic>>(
          any(),
          data: any(named: 'data'),
        ),
      ).thenAnswer(
        (_) async => Response(
          data: {
            'id': '1',
            'email': 'test@example.com',
            'name': 'Test User',
            'access_token': 'token123',
          },
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        ),
      );

      final entity = await repository.login(
        email: 'test@example.com',
        password: 'password',
      );

      expect(entity.id, '1');
      expect(entity.email, 'test@example.com');
      expect(entity.name, 'Test User');
      expect(entity.accessToken, 'token123');
    });

    test('login rethrows on network error', () async {
      when(
        () => mockApiClient.post<Map<String, dynamic>>(
          any(),
          data: any(named: 'data'),
        ),
      ).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: ''),
          message: 'Network error',
        ),
      );

      expect(
        () => repository.login(email: 'test@example.com', password: 'bad'),
        throwsA(isA<DioException>()),
      );
    });
  });
}

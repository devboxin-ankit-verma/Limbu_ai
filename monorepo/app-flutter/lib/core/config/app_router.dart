/// Application router.
///
/// All route definitions. No business logic or API calls here.
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/customer/presentation/customer_home_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/provider/presentation/provider_home_screen.dart';
import '../../features/provider/presentation/provider_payment_screen.dart';
import '../../features/provider/presentation/provider_setup_screen.dart';
import '../constants/app_constants.dart';

final appRouter = GoRouter(
  initialLocation: AppConstants.routeOnboarding,
  routes: [
    GoRoute(
      path: AppConstants.routeOnboarding,
      builder: (_, __) => const OnboardingScreen(),
    ),
    GoRoute(
      path: AppConstants.routeLogin,
      builder: (_, __) => const LoginScreen(),
    ),
    GoRoute(
      path: AppConstants.routeRegister,
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final role = extra?['role'] as String? ?? 'customer';
        return RegisterScreen(role: role);
      },
    ),
    // Provider routes
    GoRoute(
      path: AppConstants.routeProviderSetup,
      builder: (_, __) => const ProviderSetupScreen(),
    ),
    GoRoute(
      path: AppConstants.routeProviderPayment,
      builder: (_, __) => const ProviderPaymentScreen(),
    ),
    GoRoute(
      path: AppConstants.routeProviderHome,
      builder: (_, __) => const ProviderHomeScreen(),
    ),
    GoRoute(
      path: AppConstants.routeProviderDashboard,
      builder: (_, __) => const ProviderHomeScreen(),
    ),
    // Customer routes
    GoRoute(
      path: AppConstants.routeCustomerHome,
      builder: (_, __) => const CustomerHomeScreen(),
    ),
  ],
);

/// Application router.
///
/// Route definitions only. No business logic, no API calls.
/// All route path strings come from AppConstants.
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../constants/app_constants.dart';

final appRouter = GoRouter(
  initialLocation: AppConstants.routeLogin,
  routes: [
    GoRoute(
      path: AppConstants.routeLogin,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: AppConstants.routeHome,
      builder: (context, state) => const HomeScreen(),
    ),
  ],
);

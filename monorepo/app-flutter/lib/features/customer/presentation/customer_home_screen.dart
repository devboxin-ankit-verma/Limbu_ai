/// Customer home — browse providers, book services, view booking history.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/config/app_config.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../provider/domain/provider_entity.dart';
import 'customer_provider.dart';

class CustomerHomeScreen extends ConsumerStatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  ConsumerState<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends ConsumerState<CustomerHomeScreen> {
  int _tab = 0;
  late Razorpay _razorpay;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);

    Future.microtask(() {
      ref.read(customerStateProvider.notifier).loadProviders();
      _loadBookingsIfAuth();
    });
  }

  void _loadBookingsIfAuth() {
    final authState = ref.read(authProvider);
    if (authState.isAuthenticated) {
      ref.read(customerStateProvider.notifier).loadBookings();
    }
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _onPaymentSuccess(PaymentSuccessResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Payment successful! Booking confirmed.'),
        backgroundColor: Colors.green,
      ),
    );
    ref.read(customerStateProvider.notifier).loadBookings();
  }

  void _onPaymentError(PaymentFailureResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Payment failed: ${response.message ?? 'Unknown error'}'),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(customerStateProvider);
    final authState = ref.watch(authProvider);
    final isAuthenticated = authState.isAuthenticated;

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.isAuthenticated && !(prev?.isAuthenticated ?? false)) {
        ref.read(customerStateProvider.notifier).loadBookings();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dai Massage'),
        actions: [
          IconButton(
            icon: Icon(isAuthenticated ? Icons.logout : Icons.login),
            onPressed: () async {
              if (isAuthenticated) {
                await ref.read(authProvider.notifier).logout();
                if (mounted) context.go(AppConstants.routeLogin);
              } else {
                if (mounted) context.push(AppConstants.routeLogin);
              }
            },
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
        onDestinationSelected: (i) {
          setState(() => _tab = i);
          if (i == 1) _loadBookingsIfAuth();
        },
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.explore_outlined), label: 'Explore'),
          NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined), label: 'My Bookings'),
        ],
      ),
      body: IndexedStack(
        index: _tab,
        children: [
          _BrowseTab(
            providers: state.providers,
            isLoading: state.isLoading,
            razorpay: _razorpay,
          ),
          _BookingsTab(
            isAuthenticated: isAuthenticated,
            bookings: state.bookings,
            isLoading: state.isLoading,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Explore tab
// ---------------------------------------------------------------------------
class _BrowseTab extends ConsumerWidget {
  final List<ProviderEntity> providers;
  final bool isLoading;
  final Razorpay razorpay;

  const _BrowseTab({
    required this.providers,
    required this.isLoading,
    required this.razorpay,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (isLoading) return const LoadingWidget();
    if (providers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.spa_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text('No providers available yet.',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text('Pull down to refresh',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(customerStateProvider.notifier).loadProviders(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: providers.length,
        itemBuilder: (_, i) => _ProviderCard(
          provider: providers[i],
          razorpay: razorpay,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Provider card with photo gallery, info, and service cards
// ---------------------------------------------------------------------------
class _ProviderCard extends ConsumerWidget {
  final ProviderEntity provider;
  final Razorpay razorpay;

  const _ProviderCard({required this.provider, required this.razorpay});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Photo gallery
          if (provider.photos.isNotEmpty)
            AspectRatio(
              aspectRatio: 3 / 4,
              child: PageView.builder(
                itemCount: provider.photos.length,
                itemBuilder: (_, i) => Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: provider.photos[i],
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                      placeholder: (_, __) => Container(
                        color: Colors.grey[200],
                        child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.broken_image_outlined,
                            size: 40, color: Colors.grey),
                      ),
                    ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 60,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.5),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (provider.photos.length > 1)
                      Positioned(
                        bottom: 10,
                        right: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black45,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            '${i + 1} / ${provider.photos.length}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w500),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            )
          else
            Container(
              height: 120,
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              child: Icon(Icons.spa, size: 48, color: theme.colorScheme.primary),
            ),

          // Provider info
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: theme.colorScheme.primary,
                  child: Text(
                    (provider.userName ?? 'P')[0].toUpperCase(),
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        provider.userName ?? 'Massage Provider',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      if (provider.bio != null && provider.bio!.isNotEmpty)
                        Text(
                          provider.bio!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: Colors.grey[600]),
                        ),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () => _showProviderProfile(context, provider),
                  icon: const Icon(Icons.person_outline, size: 16),
                  label: const Text('Profile'),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          // Expertise chips
          if (provider.expertise.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                children: provider.expertise
                    .take(4)
                    .map((e) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color:
                                theme.colorScheme.primary.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(e,
                              style: TextStyle(
                                  fontSize: 11,
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w500)),
                        ))
                    .toList(),
              ),
            ),

          // Services section
          if (provider.services.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  Icon(Icons.spa, size: 18, color: theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  Text('Services',
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.w600)),
                  const Spacer(),
                  Text('${provider.services.length} available',
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.grey[500])),
                ],
              ),
            ),
            ...provider.services.map(
              (s) => _ServiceCard(
                service: s,
                provider: provider,
                razorpay: razorpay,
              ),
            ),
          ],
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  void _showProviderProfile(BuildContext context, ProviderEntity provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollCtrl) => SingleChildScrollView(
          controller: scrollCtrl,
          padding: const EdgeInsets.all(20),
          child: _ProviderProfileSheet(provider: provider),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Individual service card with book button
// ---------------------------------------------------------------------------
class _ServiceCard extends ConsumerWidget {
  final ServiceEntity service;
  final ProviderEntity provider;
  final Razorpay razorpay;

  const _ServiceCard({
    required this.service,
    required this.provider,
    required this.razorpay,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.spa, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(service.name,
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 4,
                    children: [
                      Icon(Icons.timer_outlined,
                          size: 14, color: Colors.grey[500]),
                      Text('${service.durationMinutes} min',
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: Colors.grey[600])),
                      const SizedBox(width: 8),
                      Text(
                        '₹${service.price.toStringAsFixed(0)}',
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  if (service.description != null &&
                      service.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      service.description!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.grey[500], fontSize: 11),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () =>
                  _handleBooking(context, ref, service, provider, razorpay),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(64, 38),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Book',
                  style:
                      TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Booking flow — login gate + date/payment dialog
// ---------------------------------------------------------------------------
Future<void> _handleBooking(BuildContext context, WidgetRef ref,
    ServiceEntity service, ProviderEntity provider, Razorpay razorpay) async {
  final isAuthenticated = ref.read(authProvider).isAuthenticated;

  if (!isAuthenticated) {
    final shouldLogin = await showModalBottomSheet<bool>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 24),
            const Icon(Icons.lock_outline, size: 48, color: Colors.orange),
            const SizedBox(height: 16),
            Text('Login Required',
                style: Theme.of(ctx)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Please sign in to book "${service.name}" with ${provider.userName ?? "this provider"}',
              textAlign: TextAlign.center,
              style: Theme.of(ctx)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(ctx, true),
                icon: const Icon(Icons.login),
                label: const Text('Sign In to Book'),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
    if (shouldLogin == true && context.mounted) {
      context.push(AppConstants.routeLogin);
    }
    return;
  }

  // User is authenticated — show booking dialog
  DateTime? selectedDate;
  String paymentMethod = 'razorpay';

  final confirmed = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setSheetState) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Text('Book Service',
                style: Theme.of(ctx)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            // Service summary card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(ctx)
                    .colorScheme
                    .primary
                    .withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(Icons.spa,
                      color: Theme.of(ctx).colorScheme.primary, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(service.name,
                            style: Theme.of(ctx).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w600)),
                        Text(
                          '${provider.userName ?? "Provider"} · ${service.durationMinutes} min',
                          style: Theme.of(ctx)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '₹${service.price.toStringAsFixed(0)}',
                    style: Theme.of(ctx).textTheme.titleMedium?.copyWith(
                          color: Theme.of(ctx).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Date & time picker
            InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () async {
                final date = await showDatePicker(
                  context: ctx,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (date != null && ctx.mounted) {
                  final time = await showTimePicker(
                    context: ctx,
                    initialTime: const TimeOfDay(hour: 10, minute: 0),
                  );
                  if (time != null) {
                    setSheetState(() {
                      selectedDate = DateTime(date.year, date.month, date.day,
                          time.hour, time.minute);
                    });
                  }
                }
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today,
                        color: selectedDate != null
                            ? Theme.of(ctx).colorScheme.primary
                            : Colors.grey),
                    const SizedBox(width: 12),
                    Text(
                      selectedDate != null
                          ? DateFormat('EEE, dd MMM yyyy · hh:mm a')
                              .format(selectedDate!)
                          : 'Select date & time',
                      style: TextStyle(
                        color:
                            selectedDate != null ? Colors.black87 : Colors.grey,
                        fontWeight: selectedDate != null
                            ? FontWeight.w500
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Payment method
            Text('Payment Method',
                style: Theme.of(ctx)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                    value: 'razorpay',
                    label: Text('Online'),
                    icon: Icon(Icons.payment)),
                ButtonSegment(
                    value: 'upi',
                    label: Text('UPI'),
                    icon: Icon(Icons.qr_code_2)),
                ButtonSegment(
                    value: 'cod',
                    label: Text('COD'),
                    icon: Icon(Icons.money)),
              ],
              selected: {paymentMethod},
              onSelectionChanged: (v) =>
                  setSheetState(() => paymentMethod = v.first),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: selectedDate == null
                  ? null
                  : () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14)),
              child: Text(
                selectedDate == null
                    ? 'Select date to continue'
                    : 'Pay ₹${service.price.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 15),
              ),
            ),
          ],
        ),
      ),
    ),
  );

  if (confirmed == true && selectedDate != null && context.mounted) {
    final result =
        await ref.read(customerStateProvider.notifier).createBooking(
              providerId: provider.id,
              serviceId: service.id,
              scheduledAt: selectedDate!,
              paymentMethod: paymentMethod,
            );

    if (result != null && context.mounted) {
      if (paymentMethod == 'razorpay') {
        final options = {
          'key': AppConfig.razorpayKeyId,
          'amount': result['amount'],
          'currency': result['currency'],
          'order_id': result['orderId'],
          'name': AppConstants.appName,
          'description': service.name,
        };
        razorpay.open(options);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('Booking confirmed with ${paymentMethod.toUpperCase()}!'),
            backgroundColor: Colors.green,
          ),
        );
        ref.read(customerStateProvider.notifier).loadBookings();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// My Bookings tab
// ---------------------------------------------------------------------------
class _BookingsTab extends ConsumerWidget {
  final bool isAuthenticated;
  final List bookings;
  final bool isLoading;

  const _BookingsTab({
    required this.isAuthenticated,
    required this.bookings,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!isAuthenticated) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.calendar_today_outlined,
                  size: 56, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text('Sign in to view your bookings',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(color: Colors.grey[600])),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => context.push(AppConstants.routeLogin),
                icon: const Icon(Icons.login),
                label: const Text('Sign In'),
              ),
            ],
          ),
        ),
      );
    }

    if (isLoading) return const LoadingWidget();
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.spa_outlined, size: 56, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text('No bookings yet',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text('Explore and book a massage!',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(customerStateProvider.notifier).loadBookings(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: bookings.length,
        itemBuilder: (_, i) {
          final b = bookings[i];
          final (statusColor, statusIcon, statusLabel) =
              switch (b.status as String) {
            'confirmed' => (Colors.green, Icons.check_circle, 'Confirmed'),
            'completed' => (Colors.blue, Icons.done_all, 'Completed'),
            'cancelled' => (Colors.red, Icons.cancel, 'Cancelled'),
            _ => (Colors.orange, Icons.schedule, 'Pending'),
          };

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(statusIcon, color: statusColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(b.serviceName ?? 'Service',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Text(b.providerName ?? 'Provider',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: Colors.grey[600])),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.calendar_today,
                                size: 12, color: Colors.grey[500]),
                            const SizedBox(width: 4),
                            Text(
                              DateFormat('dd MMM, hh:mm a')
                                  .format(b.scheduledAt),
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: Colors.grey[500]),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('₹${b.amount.toStringAsFixed(0)}',
                          style: Theme.of(context)
                              .textTheme
                              .titleSmall
                              ?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(statusLabel,
                            style: TextStyle(
                                color: statusColor,
                                fontSize: 11,
                                fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Provider profile bottom sheet — shown when customer taps "Profile"
// ---------------------------------------------------------------------------
class _ProviderProfileSheet extends StatelessWidget {
  final ProviderEntity provider;
  const _ProviderProfileSheet({required this.provider});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Drag handle
        Center(
          child: Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),

        // Photo gallery
        if (provider.photos.isNotEmpty) ...[
          SizedBox(
            height: 220,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: provider.photos.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (_, i) => ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: CachedNetworkImage(
                  imageUrl: provider.photos[i],
                  width: 160,
                  fit: BoxFit.cover,
                  alignment: Alignment.topCenter,
                  placeholder: (_, __) => Container(
                    width: 160,
                    color: Colors.grey[200],
                    child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    width: 160,
                    color: Colors.grey[200],
                    child: const Icon(Icons.broken_image_outlined),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],

        // Name + avatar
        Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: theme.colorScheme.primary,
              child: Text(
                (provider.userName ?? 'P')[0].toUpperCase(),
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(provider.userName ?? 'Provider',
                      style: theme.textTheme.titleLarge
                          ?.copyWith(fontWeight: FontWeight.bold)),
                  if (provider.userPhone != null)
                    Text(provider.userPhone!,
                        style: theme.textTheme.bodySmall
                            ?.copyWith(color: Colors.grey[600])),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Bio
        if (provider.bio != null && provider.bio!.isNotEmpty) ...[
          Text('About', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(provider.bio!, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey[700])),
          const SizedBox(height: 16),
        ],

        // Expertise
        if (provider.expertise.isNotEmpty) ...[
          Text('Expertise', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: provider.expertise
                .map((e) => Chip(
                      label: Text(e, style: const TextStyle(fontSize: 12)),
                      visualDensity: VisualDensity.compact,
                      backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.08),
                      side: BorderSide.none,
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
        ],

        // Services list
        if (provider.services.isNotEmpty) ...[
          Text('Services',
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ...provider.services.map((s) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.spa, color: theme.colorScheme.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.name,
                              style: theme.textTheme.bodyMedium
                                  ?.copyWith(fontWeight: FontWeight.w600)),
                          if (s.description != null && s.description!.isNotEmpty)
                            Text(s.description!,
                                style: theme.textTheme.bodySmall
                                    ?.copyWith(color: Colors.grey[600]),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₹${s.price.toStringAsFixed(0)}',
                            style: theme.textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold)),
                        Text('${s.durationMinutes} min',
                            style: theme.textTheme.bodySmall
                                ?.copyWith(color: Colors.grey[500])),
                      ],
                    ),
                  ],
                ),
              )),
        ],
        const SizedBox(height: 20),
      ],
    );
  }
}

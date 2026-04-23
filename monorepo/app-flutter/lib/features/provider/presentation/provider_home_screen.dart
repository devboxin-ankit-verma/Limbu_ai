/// Provider home — shows profile status, pending/upcoming bookings, wallet balance.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/tagline_header.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../customer/domain/booking_entity.dart';
import '../domain/provider_entity.dart';
import 'provider_provider.dart';

class ProviderHomeScreen extends ConsumerStatefulWidget {
  const ProviderHomeScreen({super.key});

  @override
  ConsumerState<ProviderHomeScreen> createState() => _ProviderHomeScreenState();
}

class _ProviderHomeScreenState extends ConsumerState<ProviderHomeScreen> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(providerStateProvider.notifier).loadProfile();
      ref.read(providerStateProvider.notifier).loadWallet();
      ref.read(providerStateProvider.notifier).loadMyBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provState = ref.watch(providerStateProvider);
    final theme = Theme.of(context);
    final provider = provState.provider;

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => context.push(AppConstants.routeAbout),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (mounted) context.go(AppConstants.routeLogin);
            },
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
        onDestinationSelected: (i) {
          setState(() => _tab = i);
          if (i == 2) ref.read(providerStateProvider.notifier).loadMyBookings();
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.spa_outlined), label: 'Services'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Bookings'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Wallet'),
          NavigationDestination(icon: Icon(Icons.person_outlined), label: 'Profile'),
        ],
      ),
      body: provState.isLoading
          ? const LoadingWidget()
          : IndexedStack(
              index: _tab,
              children: [
                _DashboardTab(provider: provider),
                _ServicesTab(provider: provider),
                _ProviderBookingsTab(bookings: provState.bookings),
                _WalletTab(walletData: provState.walletData, provider: provider),
                _ProfileTab(provider: provider),
              ],
            ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  final dynamic provider;
  const _DashboardTab({this.provider});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (provider == null) {
      return const Center(child: Text('Loading your profile...'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const TaglineHeader(margin: EdgeInsets.only(bottom: 12)),
          // Status banner
          _StatusBanner(status: provider.status, hasFeePaid: provider.hasFeePaid),
          const SizedBox(height: 16),
          // Quick stats
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'Wallet Balance',
                  value:
                      '₹${NumberFormat('#,##0.00').format(provider.walletBalance)}',
                  icon: Icons.account_balance_wallet,
                  color: Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  label: 'Services',
                  value: '${provider.services.length}',
                  icon: Icons.spa,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (!provider.hasFeePaid) ...[
            Card(
              color: Colors.orange[50],
              child: ListTile(
                leading: const Icon(Icons.payment, color: Colors.orange),
                title: const Text('Complete Registration'),
                subtitle: const Text('Pay fee to go live'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () => context.push(AppConstants.routeProviderPayment),
              ),
            ),
            const SizedBox(height: 16),
          ],
          if (!provider.hasProfileSetup) ...[
            Card(
              color: Colors.blue[50],
              child: ListTile(
                leading: const Icon(Icons.edit, color: Colors.blue),
                title: const Text('Complete Your Profile'),
                subtitle: const Text('Add bio, expertise and services'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () => context.push(AppConstants.routeProviderSetup),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  final String status;
  final bool hasFeePaid;

  const _StatusBanner({required this.status, required this.hasFeePaid});

  @override
  Widget build(BuildContext context) {
    final (color, icon, msg) = switch (status) {
      'approved' => (Colors.green, Icons.verified, 'Your profile is live!'),
      'rejected' => (Colors.red, Icons.cancel, 'Registration rejected. Contact support.'),
      _ => hasFeePaid
          ? (Colors.orange, Icons.hourglass_top, 'Under review by admin')
          : (Colors.grey, Icons.pending, 'Complete setup to get reviewed'),
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Text(msg,
                style: TextStyle(color: color, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(value,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.grey[600])),
          ],
        ),
      ),
    );
  }
}

class _ServicesTab extends ConsumerWidget {
  final dynamic provider;
  const _ServicesTab({this.provider});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    if (provider == null) {
      return const Center(child: Text('Loading your services...'));
    }

    final services = provider.services as List<ServiceEntity>;

    return Scaffold(
      body: services.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.spa_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text('No services added yet',
                      style: theme.textTheme.titleMedium
                          ?.copyWith(color: Colors.grey[600])),
                  const SizedBox(height: 8),
                  Text('Add your massage services to get bookings',
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.grey[500])),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showServiceDialog(context, ref),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Service'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(providerStateProvider.notifier).loadProfile(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: services.length,
                itemBuilder: (_, i) {
                  final s = services[i];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(Icons.spa,
                                    color: theme.colorScheme.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(s.name,
                                        style: theme.textTheme.titleMedium
                                            ?.copyWith(
                                                fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${s.durationMinutes} min',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(color: Colors.grey[600]),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                '₹${s.price.toStringAsFixed(0)}',
                                style: theme.textTheme.titleLarge?.copyWith(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          if (s.description != null &&
                              s.description!.isNotEmpty) ...[
                            const SizedBox(height: 10),
                            Text(s.description!,
                                style: theme.textTheme.bodySmall
                                    ?.copyWith(color: Colors.grey[700])),
                          ],
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton.icon(
                                onPressed: () =>
                                    _showServiceDialog(context, ref, index: i, service: s),
                                icon: const Icon(Icons.edit_outlined, size: 18),
                                label: const Text('Edit'),
                              ),
                              const SizedBox(width: 8),
                              TextButton.icon(
                                onPressed: () =>
                                    _confirmDelete(context, ref, i, s.name),
                                icon: Icon(Icons.delete_outline,
                                    size: 18, color: Colors.red[400]),
                                label: Text('Delete',
                                    style: TextStyle(color: Colors.red[400])),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: services.isNotEmpty
          ? FloatingActionButton(
              onPressed: () => _showServiceDialog(context, ref),
              child: const Icon(Icons.add),
            )
          : null,
    );
  }

  Future<void> _showServiceDialog(BuildContext context, WidgetRef ref,
      {int? index, ServiceEntity? service}) async {
    final nameCtrl = TextEditingController(text: service?.name ?? '');
    final descCtrl = TextEditingController(text: service?.description ?? '');
    final priceCtrl =
        TextEditingController(text: service?.price.toStringAsFixed(0) ?? '');
    final durationCtrl = TextEditingController(
        text: service?.durationMinutes.toString() ?? '60');
    final isEditing = service != null;
    final formKey = GlobalKey<FormState>();

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Form(
          key: formKey,
          child: SingleChildScrollView(
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
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  isEditing ? 'Edit Service' : 'Add New Service',
                  style: Theme.of(ctx)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Service Name',
                    hintText: 'e.g. Full Body Massage',
                    prefixIcon: Icon(Icons.spa),
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: descCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Description (optional)',
                    hintText: 'Brief description of the service',
                    prefixIcon: Icon(Icons.description),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: priceCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Price (₹)',
                          prefixIcon: Icon(Icons.currency_rupee),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Required';
                          if (double.tryParse(v) == null) return 'Invalid';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: durationCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Duration (min)',
                          prefixIcon: Icon(Icons.timer),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Required';
                          if (int.tryParse(v) == null) return 'Invalid';
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (formKey.currentState!.validate()) {
                      Navigator.pop(ctx, true);
                    }
                  },
                  child: Text(isEditing ? 'Update Service' : 'Add Service'),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (result == true && context.mounted) {
      final data = {
        'name': nameCtrl.text.trim(),
        'description': descCtrl.text.trim(),
        'price': double.parse(priceCtrl.text.trim()),
        'durationMinutes': int.parse(durationCtrl.text.trim()),
      };

      final notifier = ref.read(providerStateProvider.notifier);
      final success = isEditing
          ? await notifier.updateService(index!, data)
          : await notifier.addService(data);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? (isEditing ? 'Service updated' : 'Service added')
                : 'Failed to save service'),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    }

    nameCtrl.dispose();
    descCtrl.dispose();
    priceCtrl.dispose();
    durationCtrl.dispose();
  }

  Future<void> _confirmDelete(
      BuildContext context, WidgetRef ref, int index, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Service'),
        content: Text('Remove "$name" from your services?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success =
          await ref.read(providerStateProvider.notifier).removeService(index);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Service removed' : 'Failed to remove'),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    }
  }
}

class _WalletTab extends StatelessWidget {
  final Map<String, dynamic>? walletData;
  final dynamic provider;

  const _WalletTab({this.walletData, this.provider});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final txnsRaw = (walletData?['txns'] as List?) ?? const [];
    final txns = txnsRaw
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          color: theme.colorScheme.primary,
          child: Column(
            children: [
              Text('Wallet Balance',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(color: Colors.white70)),
              const SizedBox(height: 8),
              Text(
                '₹${NumberFormat('#,##0.00').format(provider?.walletBalance ?? 0)}',
                style: theme.textTheme.displaySmall
                    ?.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        Expanded(
          child: txns.isEmpty
              ? const Center(child: Text('No transactions yet'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: txns.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (_, i) {
                    final txn = txns[i];
                    final isCredit = txn['type'] == 'credit';
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor:
                            isCredit ? Colors.green[50] : Colors.red[50],
                        child: Icon(
                          isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                          color: isCredit ? Colors.green : Colors.red,
                        ),
                      ),
                      title: Text(txn['note'] as String? ?? 'Transaction'),
                      subtitle: Text(txn['createdAt'] as String? ?? ''),
                      trailing: Text(
                        '${isCredit ? '+' : '-'}₹${txn['amount']}',
                        style: TextStyle(
                          color: isCredit ? Colors.green : Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _ProfileTab extends StatelessWidget {
  final dynamic provider;
  const _ProfileTab({this.provider});

  @override
  Widget build(BuildContext context) {
    if (provider == null) return const Center(child: Text('Loading...'));
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if ((provider.photos as List).isNotEmpty) ...[
            SizedBox(
              height: 180,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: provider.photos.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (_, i) => ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    provider.photos[i] as String,
                    width: 240,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 240,
                      color: Colors.grey[200],
                      child: const Icon(Icons.broken_image_outlined),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: theme.colorScheme.primary,
                    child: const Icon(Icons.person, size: 44, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
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
          ),
          const SizedBox(height: 12),
          if (provider.bio != null && provider.bio!.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('About', style: theme.textTheme.titleSmall),
                    const SizedBox(height: 8),
                    Text(provider.bio!),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          if (provider.expertise.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Expertise', style: theme.textTheme.titleSmall),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: (provider.expertise as List<String>)
                          .map((e) => Chip(label: Text(e)))
                          .toList(),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () => context.push(AppConstants.routeProviderSetup),
            icon: const Icon(Icons.edit),
            label: const Text('Edit Profile'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Provider Bookings Tab
// ---------------------------------------------------------------------------
class _ProviderBookingsTab extends ConsumerWidget {
  final List<BookingEntity> bookings;
  const _ProviderBookingsTab({required this.bookings});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_month_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text('No bookings yet',
                style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text('Bookings from customers will appear here',
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(providerStateProvider.notifier).loadMyBookings(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: bookings.length,
        itemBuilder: (_, i) {
          final b = bookings[i];
          final (statusColor, statusIcon, statusLabel) = switch (b.status) {
            'confirmed' => (Colors.blue, Icons.check_circle_outline, 'Confirmed'),
            'completed' => (Colors.green, Icons.done_all, 'Completed'),
            'cancelled' => (Colors.red, Icons.cancel_outlined, 'Cancelled'),
            _ => (Colors.orange, Icons.schedule, 'Pending'),
          };

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(statusIcon, color: statusColor, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(b.customerName ?? 'Customer',
                                style: theme.textTheme.titleSmall
                                    ?.copyWith(fontWeight: FontWeight.w600)),
                            Text(b.serviceName ?? 'Service',
                                style: theme.textTheme.bodySmall
                                    ?.copyWith(color: Colors.grey[600])),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('₹${b.amount.toStringAsFixed(0)}',
                              style: theme.textTheme.titleSmall
                                  ?.copyWith(fontWeight: FontWeight.bold)),
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
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
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 13, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('dd MMM yyyy, hh:mm a').format(b.scheduledAt),
                        style: theme.textTheme.bodySmall
                            ?.copyWith(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  if (b.status == 'confirmed') ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _markCompleted(context, ref, b),
                        icon: const Icon(Icons.done_all, size: 18),
                        label: const Text('Mark as Completed'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _markCompleted(
      BuildContext context, WidgetRef ref, BookingEntity booking) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Mark as Completed?'),
        content: Text(
            'Confirm that you have completed the service for ${booking.customerName ?? 'the customer'}.\n\n₹${booking.amount.toStringAsFixed(0)} will be credited to your wallet.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final success = await ref.read(providerStateProvider.notifier).completeBooking(booking.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(success
              ? '✓ Booking completed! ₹${booking.amount.toStringAsFixed(0)} credited to wallet.'
              : 'Failed to complete booking. Try again.'),
          backgroundColor: success ? Colors.green : Colors.red,
        ));
      }
    }
  }
}

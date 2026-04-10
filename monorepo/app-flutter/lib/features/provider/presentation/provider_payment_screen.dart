/// Provider registration fee payment screen using Razorpay.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../../core/config/app_config.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/loading_widget.dart';
import 'provider_provider.dart';

class ProviderPaymentScreen extends ConsumerStatefulWidget {
  const ProviderPaymentScreen({super.key});

  @override
  ConsumerState<ProviderPaymentScreen> createState() =>
      _ProviderPaymentScreenState();
}

class _ProviderPaymentScreenState extends ConsumerState<ProviderPaymentScreen> {
  late Razorpay _razorpay;
  bool _loading = false;
  String _paymentMethod = 'razorpay';

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  Future<void> _initiatePayment() async {
    if (_paymentMethod != 'razorpay') {
      final success = await ref
          .read(providerStateProvider.notifier)
          .completeRegistrationWithManualMethod(_paymentMethod);
      if (!mounted) return;
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration marked via ${_paymentMethod.toUpperCase()}. Awaiting admin approval.'),
            backgroundColor: Colors.green,
          ),
        );
        context.go(AppConstants.routeProviderHome);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to complete registration. Please try again.')),
        );
      }
      return;
    }

    setState(() => _loading = true);
    final order =
        await ref.read(providerStateProvider.notifier).createRegistrationOrder();
    setState(() => _loading = false);

    if (order == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create payment order. Try again.')),
        );
      }
      return;
    }

    final options = {
      'key': AppConfig.razorpayKeyId,
      'amount': order.amount,
      'currency': order.currency,
      'order_id': order.orderId,
      'name': AppConstants.appName,
      'description': 'Provider Registration Fee',
      'prefill': {'contact': '', 'email': ''},
    };

    _razorpay.open(options);
  }

  void _onPaymentSuccess(PaymentSuccessResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Payment successful! Your profile is under review.'),
        backgroundColor: Colors.green,
      ),
    );
    context.go(AppConstants.routeProviderHome);
  }

  void _onPaymentError(PaymentFailureResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Payment failed: ${response.message ?? 'Unknown error'}'),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('External wallet: ${response.walletName}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDevMode = AppConfig.appEnv.toLowerCase() != 'production';

    return Scaffold(
      appBar: AppBar(title: const Text('Registration Fee')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.verified_user,
                      size: 50, color: theme.colorScheme.primary),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'One-time Registration Fee',
                style: theme.textTheme.headlineSmall
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                '₹999',
                style: theme.textTheme.displaySmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      _BenefitRow(Icons.check_circle, 'Your profile goes live after admin approval'),
                      _BenefitRow(Icons.check_circle, 'Receive unlimited bookings'),
                      _BenefitRow(Icons.check_circle, 'Earnings credited to your wallet'),
                      _BenefitRow(Icons.check_circle, 'One-time fee, no monthly charges'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (isDevMode) ...[
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Payment Method',
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(height: 8),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'razorpay', label: Text('Razorpay'), icon: Icon(Icons.payment)),
                    ButtonSegment(value: 'upi', label: Text('UPI'), icon: Icon(Icons.qr_code_2)),
                    ButtonSegment(value: 'cod', label: Text('COD'), icon: Icon(Icons.local_shipping_outlined)),
                  ],
                  selected: {_paymentMethod},
                  onSelectionChanged: (value) {
                    setState(() => _paymentMethod = value.first);
                  },
                ),
              ],
              const Spacer(),
              if (_loading)
                const LoadingWidget()
              else
                ElevatedButton(
                  onPressed: _initiatePayment,
                  child: Text(
                    _paymentMethod == 'razorpay'
                        ? 'Pay ₹999 via Razorpay'
                        : 'Continue with ${_paymentMethod.toUpperCase()}',
                  ),
                ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go(AppConstants.routeProviderHome),
                child: const Text('Pay Later'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BenefitRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _BenefitRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, color: Colors.green, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyMedium)),
        ],
      ),
    );
  }
}

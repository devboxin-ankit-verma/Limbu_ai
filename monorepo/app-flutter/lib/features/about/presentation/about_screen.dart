import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/tagline_header.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('About Us'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const TaglineHeader(margin: EdgeInsets.zero),
            const SizedBox(height: 16),
            Text(
              AppConstants.appName,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              '“${AppConstants.appTagline}”',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'यह पंक्ति हमारे काम का वचन है। इसका अर्थ है कि दाई मालिश की सेवा सिर्फ सुविधा नहीं, बल्कि भरोसे की परंपरा है जो एक पीढ़ी से दूसरी पीढ़ी तक पहुंचती है।',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 10),
            Text(
              'हमारा उद्देश्य पारंपरिक ज्ञान, सुरक्षित सेवा, और सम्मानजनक अनुभव को जोड़ना है ताकि हर परिवार को विश्वसनीय सेवा मिल सके।',
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 10),
            Text(
              'Desi Dai Massage में हर सेवा प्रदाता की पहचान सत्यापित की जाती है, और उपयोगकर्ताओं को पारदर्शी बुकिंग, भुगतान, तथा सेवा ट्रैकिंग का अनुभव दिया जाता है।',
              style: theme.textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}

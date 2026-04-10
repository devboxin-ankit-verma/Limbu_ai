/// Provider profile setup — multi-step form (bio, expertise, services).
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/loading_widget.dart';
import 'provider_provider.dart';

class ProviderSetupScreen extends ConsumerStatefulWidget {
  const ProviderSetupScreen({super.key});

  @override
  ConsumerState<ProviderSetupScreen> createState() => _ProviderSetupScreenState();
}

class _ProviderSetupScreenState extends ConsumerState<ProviderSetupScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1 — Bio
  final _bioCtrl = TextEditingController();
  final List<XFile> _photos = [];

  // Step 2 — Expertise
  final List<String> _expertise = [];
  final _expertiseCtrl = TextEditingController();

  // Step 3 — Services
  final List<Map<String, dynamic>> _services = [];
  final _serviceNameCtrl = TextEditingController();
  final _servicePriceCtrl = TextEditingController();
  final _serviceDurationCtrl = TextEditingController();
  final _serviceDescCtrl = TextEditingController();

  final List<String> _expertiseSuggestions = [
    'Neonatal Massage',
    'Infant Massage',
    'Postnatal Massage',
    'Traditional Dai Massage',
    'Herbal Oil Massage',
    'Baby Bone Setting',
    'Abhyanga',
    'Head Massage',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _bioCtrl.dispose();
    _expertiseCtrl.dispose();
    _serviceNameCtrl.dispose();
    _servicePriceCtrl.dispose();
    _serviceDurationCtrl.dispose();
    _serviceDescCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      setState(() => _currentStep++);
    }
  }

  Future<void> _pickPhotos() async {
    final picker = ImagePicker();
    final selected = await picker.pickMultiImage(imageQuality: 75);
    if (selected.isEmpty) return;
    setState(() {
      for (final file in selected) {
        if (_photos.length >= 10) break;
        _photos.add(file);
      }
    });
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      setState(() => _currentStep--);
    }
  }

  void _addExpertise(String value) {
    final trimmed = value.trim();
    if (trimmed.isNotEmpty && !_expertise.contains(trimmed)) {
      setState(() => _expertise.add(trimmed));
      _expertiseCtrl.clear();
    }
  }

  void _addService() {
    final name = _serviceNameCtrl.text.trim();
    final price = double.tryParse(_servicePriceCtrl.text.trim());
    final duration = int.tryParse(_serviceDurationCtrl.text.trim());

    if (name.isEmpty || price == null || duration == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all service details')),
      );
      return;
    }

    setState(() {
      _services.add({
        'name': name,
        'description': _serviceDescCtrl.text.trim().isEmpty
            ? null
            : _serviceDescCtrl.text.trim(),
        'price': price,
        'durationMinutes': duration,
      });
    });

    _serviceNameCtrl.clear();
    _servicePriceCtrl.clear();
    _serviceDurationCtrl.clear();
    _serviceDescCtrl.clear();
  }

  Future<void> _submitProfile() async {
    if (_bioCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Please add a bio')));
      return;
    }
    if (_expertise.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please add at least one expertise')));
      return;
    }
    if (_services.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please add at least one service')));
      return;
    }

    List<String> photoUrls = [];
    if (_photos.isNotEmpty) {
      try {
        photoUrls = await ref.read(providerRepositoryProvider).uploadProviderPhotos(_photos);
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Photo upload failed. Please try again.')),
          );
        }
        return;
      }
    }

    final success = await ref.read(providerStateProvider.notifier).setupProfile(
          bio: _bioCtrl.text.trim(),
          photos: photoUrls,
          expertise: _expertise,
          services: _services,
        );

    if (success && mounted) {
      context.go(AppConstants.routeProviderPayment);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(providerStateProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Setup Your Profile'),
        leading: _currentStep > 0
            ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: _prevStep)
            : null,
      ),
      body: Column(
        children: [
          // Step indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Row(
              children: List.generate(3, (i) {
                return Expanded(
                  child: Container(
                    height: 4,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: i <= _currentStep
                          ? theme.colorScheme.primary
                          : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Text(
                  ['Step 1: About You', 'Step 2: Expertise', 'Step 3: Services'][_currentStep],
                  style: theme.textTheme.titleSmall
                      ?.copyWith(color: theme.colorScheme.primary, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text('${_currentStep + 1}/3',
                    style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _Step1Bio(
                  bioCtrl: _bioCtrl,
                  photos: _photos,
                  onPickPhotos: _pickPhotos,
                  onRemovePhoto: (idx) => setState(() => _photos.removeAt(idx)),
                  onNext: _nextStep,
                ),
                _Step2Expertise(
                  expertise: _expertise,
                  expertiseCtrl: _expertiseCtrl,
                  suggestions: _expertiseSuggestions,
                  onAdd: _addExpertise,
                  onRemove: (e) => setState(() => _expertise.remove(e)),
                  onNext: _nextStep,
                ),
                _Step3Services(
                  services: _services,
                  nameCtrl: _serviceNameCtrl,
                  priceCtrl: _servicePriceCtrl,
                  durationCtrl: _serviceDurationCtrl,
                  descCtrl: _serviceDescCtrl,
                  onAdd: _addService,
                  onRemove: (i) => setState(() => _services.removeAt(i)),
                  onSubmit: state.isLoading ? null : _submitProfile,
                  isLoading: state.isLoading,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Step1Bio extends StatelessWidget {
  final TextEditingController bioCtrl;
  final List<XFile> photos;
  final VoidCallback onPickPhotos;
  final void Function(int) onRemovePhoto;
  final VoidCallback onNext;

  const _Step1Bio({
    required this.bioCtrl,
    required this.photos,
    required this.onPickPhotos,
    required this.onRemovePhoto,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Tell customers about yourself',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          TextFormField(
            controller: bioCtrl,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Bio / About You',
              hintText:
                  'Describe your experience, training, and specialization in traditional massage...',
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Text('Profile Photos', style: Theme.of(context).textTheme.titleSmall),
              const Spacer(),
              TextButton.icon(
                onPressed: onPickPhotos,
                icon: const Icon(Icons.photo_library_outlined),
                label: const Text('Add Photos'),
              ),
            ],
          ),
          if (photos.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 92,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: photos.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) => Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(
                        File(photos[i].path),
                        width: 92,
                        height: 92,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 92,
                          height: 92,
                          color: Colors.grey[200],
                          child: const Icon(Icons.broken_image_outlined),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      top: 0,
                      child: InkWell(
                        onTap: () => onRemovePhoto(i),
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Colors.black54,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, size: 14, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              if (bioCtrl.text.trim().isEmpty) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(const SnackBar(content: Text('Please enter your bio')));
                return;
              }
              onNext();
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}

class _Step2Expertise extends StatelessWidget {
  final List<String> expertise;
  final TextEditingController expertiseCtrl;
  final List<String> suggestions;
  final void Function(String) onAdd;
  final void Function(String) onRemove;
  final VoidCallback onNext;

  const _Step2Expertise({
    required this.expertise,
    required this.expertiseCtrl,
    required this.suggestions,
    required this.onAdd,
    required this.onRemove,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('What are your areas of expertise?',
              style: theme.textTheme.titleMedium),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: expertiseCtrl,
                  decoration: const InputDecoration(labelText: 'Add expertise'),
                  onSubmitted: onAdd,
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => onAdd(expertiseCtrl.text),
                style: ElevatedButton.styleFrom(minimumSize: const Size(60, 50)),
                child: const Icon(Icons.add),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Suggestions:', style: theme.textTheme.bodySmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: suggestions
                .where((s) => !expertise.contains(s))
                .map(
                  (s) => GestureDetector(
                    onTap: () => onAdd(s),
                    child: Chip(
                      label: Text(s),
                      avatar: const Icon(Icons.add_circle_outline, size: 16),
                    ),
                  ),
                )
                .toList(),
          ),
          if (expertise.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Added:', style: theme.textTheme.bodySmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: expertise
                  .map(
                    (e) => Chip(
                      label: Text(e),
                      backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.15),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => onRemove(e),
                    ),
                  )
                  .toList(),
            ),
          ],
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: expertise.isEmpty ? null : onNext,
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}

class _Step3Services extends StatelessWidget {
  final List<Map<String, dynamic>> services;
  final TextEditingController nameCtrl;
  final TextEditingController priceCtrl;
  final TextEditingController durationCtrl;
  final TextEditingController descCtrl;
  final VoidCallback onAdd;
  final void Function(int) onRemove;
  final VoidCallback? onSubmit;
  final bool isLoading;

  const _Step3Services({
    required this.services,
    required this.nameCtrl,
    required this.priceCtrl,
    required this.durationCtrl,
    required this.descCtrl,
    required this.onAdd,
    required this.onRemove,
    required this.onSubmit,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Add your services', style: theme.textTheme.titleMedium),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: nameCtrl,
                    decoration:
                        const InputDecoration(labelText: 'Service Name *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descCtrl,
                    decoration:
                        const InputDecoration(labelText: 'Description (optional)'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: priceCtrl,
                          keyboardType: TextInputType.number,
                          decoration:
                              const InputDecoration(labelText: 'Price (₹) *'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: durationCtrl,
                          keyboardType: TextInputType.number,
                          decoration:
                              const InputDecoration(labelText: 'Duration (min) *'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: onAdd,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Service'),
                  ),
                ],
              ),
            ),
          ),
          if (services.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Services Added:', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            ...services.asMap().entries.map(
                  (entry) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: theme.colorScheme.primary,
                        child: const Icon(Icons.spa, color: Colors.white, size: 20),
                      ),
                      title: Text(entry.value['name'] as String),
                      subtitle: Text(
                          '₹${entry.value['price']} · ${entry.value['durationMinutes']} min'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () => onRemove(entry.key),
                      ),
                    ),
                  ),
                ),
          ],
          const SizedBox(height: 32),
          if (isLoading)
            const LoadingWidget()
          else
            ElevatedButton(
              onPressed: onSubmit,
              child: const Text('Save & Continue'),
            ),
        ],
      ),
    );
  }
}

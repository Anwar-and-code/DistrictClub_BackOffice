import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        leading: IconButton(
          icon: Icon(AppIcons.arrowBack, color: AppColors.iconPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Centre d\'aide',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            Padding(
              padding: AppSpacing.screenPadding,
              child: TextField(
                controller: _searchController,
                onChanged: (value) => setState(() => _searchQuery = value),
                decoration: InputDecoration(
                  hintText: 'Rechercher une question...',
                  prefixIcon: Icon(AppIcons.search, color: AppColors.iconSecondary),
                  filled: true,
                  fillColor: AppColors.surfaceSubtle,
                  border: OutlineInputBorder(
                    borderRadius: AppRadius.borderRadiusFull,
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                ),
              ),
            ),

            // Quick Actions
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Row(
                children: [
                  Expanded(
                    child: _QuickActionCard(
                      icon: Icons.chat_bubble_outline,
                      title: 'Chat',
                      subtitle: 'Discutez avec nous',
                      color: AppColors.brandPrimary,
                      onTap: () => _showChatDialog(),
                    ),
                  ),
                  AppSpacing.hGapMd,
                  Expanded(
                    child: _QuickActionCard(
                      icon: Icons.email_outlined,
                      title: 'Email',
                      subtitle: 'Envoyez un email',
                      color: AppColors.brandSecondary,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Email: support@padelhouse.ci'),
                            backgroundColor: AppColors.brandPrimary,
                          ),
                        );
                      },
                    ),
                  ),
                  AppSpacing.hGapMd,
                  Expanded(
                    child: _QuickActionCard(
                      icon: Icons.phone_outlined,
                      title: 'Appeler',
                      subtitle: 'Service client',
                      color: AppColors.success,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Tél: +225 07 77 46 56 00'),
                            backgroundColor: AppColors.brandPrimary,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            AppSpacing.vGapXl,

            // FAQ Section
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Text(
                'Questions fréquentes',
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            AppSpacing.vGapMd,

            ..._faqCategories.map((category) => _FAQCategorySection(
              category: category,
              searchQuery: _searchQuery,
            )),

            AppSpacing.vGapXl,

            // Contact Form
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Vous n\'avez pas trouvé votre réponse ?',
                    style: AppTypography.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  AppSpacing.vGapSm,
                  Text(
                    'Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  AppSpacing.vGapMd,
                  AppButton(
                    label: 'Nous contacter',
                    icon: Icons.mail_outline,
                    isFullWidth: true,
                    onPressed: () => _showContactForm(),
                  ),
                ],
              ),
            ),

            AppSpacing.vGapXxl,
          ],
        ),
      ),
    );
  }

  void _showChatDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => _ChatSupportWidget(
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _showContactForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: const _ContactFormWidget(),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.cardBorderRadius,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color),
                ),
                AppSpacing.vGapSm,
                Text(
                  title,
                  style: AppTypography.labelMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  subtitle,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textTertiary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FAQCategorySection extends StatelessWidget {
  const _FAQCategorySection({
    required this.category,
    required this.searchQuery,
  });

  final _FAQCategory category;
  final String searchQuery;

  @override
  Widget build(BuildContext context) {
    final filteredItems = searchQuery.isEmpty
        ? category.items
        : category.items.where((item) =>
            item.question.toLowerCase().contains(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().contains(searchQuery.toLowerCase())).toList();

    if (filteredItems.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: AppSpacing.screenPaddingHorizontalOnly,
          child: Row(
            children: [
              Icon(category.icon, color: AppColors.brandPrimary, size: 20),
              AppSpacing.hGapSm,
              Text(
                category.title,
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        AppSpacing.vGapSm,
        ...filteredItems.map((item) => _FAQItem(item: item)),
        AppSpacing.vGapMd,
      ],
    );
  }
}

class _FAQItem extends StatefulWidget {
  const _FAQItem({required this.item});

  final _FAQItemData item;

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: () => setState(() => _isExpanded = !_isExpanded),
          borderRadius: AppRadius.cardBorderRadius,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.item.question,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Icon(
                      _isExpanded ? Icons.expand_less : Icons.expand_more,
                      color: AppColors.iconSecondary,
                    ),
                  ],
                ),
                if (_isExpanded) ...[
                  AppSpacing.vGapMd,
                  Text(
                    widget.item.answer,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ChatSupportWidget extends StatefulWidget {
  const _ChatSupportWidget({required this.scrollController});

  final ScrollController scrollController;

  @override
  State<_ChatSupportWidget> createState() => _ChatSupportWidgetState();
}

class _ChatSupportWidgetState extends State<_ChatSupportWidget> {
  final TextEditingController _messageController = TextEditingController();
  final List<_ChatMessage> _messages = [
    _ChatMessage(
      text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      isFromSupport: true,
      time: '14:30',
    ),
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(
        text: text,
        isFromSupport: false,
        time: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
      ));
    });
    _messageController.clear();

    // Simulate auto-reply
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(
            text: 'Merci pour votre message ! Un conseiller vous répondra dans les plus brefs délais.',
            isFromSupport: true,
            time: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          ));
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.brandPrimary,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.xl),
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.white,
                child: Icon(Icons.support_agent, color: AppColors.brandPrimary),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Support PadelHouse',
                      style: AppTypography.titleSmall.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        AppSpacing.hGapXs,
                        Text(
                          'En ligne',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.white.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.close, color: AppColors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: widget.scrollController,
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final message = _messages[index];
              return Align(
                alignment: message.isFromSupport
                    ? Alignment.centerLeft
                    : Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.75,
                  ),
                  decoration: BoxDecoration(
                    color: message.isFromSupport
                        ? AppColors.surfaceSubtle
                        : AppColors.brandPrimary,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        message.text,
                        style: AppTypography.bodyMedium.copyWith(
                          color: message.isFromSupport
                              ? AppColors.textPrimary
                              : AppColors.white,
                        ),
                      ),
                      AppSpacing.vGapXxs,
                      Text(
                        message.time,
                        style: AppTypography.caption.copyWith(
                          color: message.isFromSupport
                              ? AppColors.textTertiary
                              : AppColors.white.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Input
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surfaceDefault,
            border: Border(
              top: BorderSide(color: AppColors.borderDefault),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  decoration: InputDecoration(
                    hintText: 'Tapez votre message...',
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(
                      borderRadius: AppRadius.borderRadiusFull,
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                  ),
                ),
              ),
              AppSpacing.hGapSm,
              Container(
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(Icons.send, color: AppColors.white),
                  onPressed: _sendMessage,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ContactFormWidget extends StatefulWidget {
  const _ContactFormWidget();

  @override
  State<_ContactFormWidget> createState() => _ContactFormWidgetState();
}

class _ContactFormWidgetState extends State<_ContactFormWidget> {
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedCategory = 'Général';

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nous contacter',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapLg,
            DropdownButtonFormField<String>(
              initialValue: _selectedCategory,
              decoration: InputDecoration(
                labelText: 'Catégorie',
                border: OutlineInputBorder(
                  borderRadius: AppRadius.borderRadiusMd,
                ),
              ),
              items: ['Général', 'Réservation', 'Paiement', 'Technique', 'Autre']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (value) => setState(() => _selectedCategory = value!),
            ),
            AppSpacing.vGapMd,
            TextField(
              controller: _subjectController,
              decoration: InputDecoration(
                labelText: 'Sujet',
                border: OutlineInputBorder(
                  borderRadius: AppRadius.borderRadiusMd,
                ),
              ),
            ),
            AppSpacing.vGapMd,
            TextField(
              controller: _messageController,
              maxLines: 5,
              decoration: InputDecoration(
                labelText: 'Message',
                alignLabelWithHint: true,
                border: OutlineInputBorder(
                  borderRadius: AppRadius.borderRadiusMd,
                ),
              ),
            ),
            AppSpacing.vGapLg,
            AppButton(
              label: 'Envoyer',
              isFullWidth: true,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Message envoyé avec succès !'),
                    backgroundColor: AppColors.success,
                  ),
                );
              },
            ),
            AppSpacing.vGapLg,
          ],
        ),
      ),
    );
  }
}

// Data Models
class _FAQCategory {
  final String title;
  final IconData icon;
  final List<_FAQItemData> items;

  _FAQCategory({
    required this.title,
    required this.icon,
    required this.items,
  });
}

class _FAQItemData {
  final String question;
  final String answer;

  _FAQItemData({required this.question, required this.answer});
}

class _ChatMessage {
  final String text;
  final bool isFromSupport;
  final String time;

  _ChatMessage({
    required this.text,
    required this.isFromSupport,
    required this.time,
  });
}

// Sample Data
final List<_FAQCategory> _faqCategories = [
  _FAQCategory(
    title: 'Réservation',
    icon: Icons.calendar_today,
    items: [
      _FAQItemData(
        question: 'Comment réserver un terrain ?',
        answer: 'Pour réserver un terrain, accédez à l\'onglet "Réservation", sélectionnez la date et l\'heure souhaitées, puis choisissez le terrain disponible. Confirmez votre réservation et procédez au paiement.',
      ),
      _FAQItemData(
        question: 'Puis-je annuler ma réservation ?',
        answer: 'Oui, vous pouvez annuler votre réservation jusqu\'à 24 heures avant l\'heure prévue. Les annulations tardives peuvent entraîner des frais.',
      ),
      _FAQItemData(
        question: 'Comment modifier ma réservation ?',
        answer: 'Accédez à vos réservations dans l\'onglet correspondant, sélectionnez la réservation à modifier et choisissez une nouvelle date ou heure disponible.',
      ),
    ],
  ),
  _FAQCategory(
    title: 'Paiement',
    icon: Icons.payment,
    items: [
      _FAQItemData(
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (Orange Money, MTN Money, Wave) et le paiement sur place.',
      ),
      _FAQItemData(
        question: 'Comment obtenir un remboursement ?',
        answer: 'En cas d\'annulation dans les délais, le remboursement est automatique sous 3-5 jours ouvrés. Pour toute autre demande, contactez notre support.',
      ),
    ],
  ),
  _FAQCategory(
    title: 'Compte',
    icon: Icons.person,
    items: [
      _FAQItemData(
        question: 'Comment créer un compte ?',
        answer: 'Téléchargez l\'application, cliquez sur "S\'inscrire" et suivez les étapes. Vous pouvez vous inscrire avec votre email ou numéro de téléphone.',
      ),
      _FAQItemData(
        question: 'J\'ai oublié mon mot de passe',
        answer: 'Sur l\'écran de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions pour le réinitialiser.',
      ),
    ],
  ),
];

import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class CoachingScreen extends StatefulWidget {
  const CoachingScreen({super.key});

  @override
  State<CoachingScreen> createState() => _CoachingScreenState();
}

class _CoachingScreenState extends State<CoachingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'Tous';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
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
          'Coaching',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.brandPrimary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.brandPrimary,
          tabs: const [
            Tab(text: 'Coachs'),
            Tab(text: 'Mes séances'),
            Tab(text: 'Historique'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: ['Tous', 'Individuel', 'Collectif', 'Initiation', 'Perfectionnement'].map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => _selectedFilter = filter);
                    },
                    selectedColor: AppColors.brandPrimary.withValues(alpha: 0.2),
                    checkmarkColor: AppColors.brandPrimary,
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.brandPrimary : AppColors.textSecondary,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildCoachesList(),
                _buildMySessionsList(),
                _buildHistoryList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoachesList() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _CoachCard(
          coach: Coach(
            id: '1',
            name: 'Alexandre Dupont',
            title: 'Coach Certifié FFT',
            specialty: 'Technique & Tactique',
            experience: '8 ans d\'expérience',
            rating: 4.9,
            reviewCount: 127,
            pricePerHour: '25 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
            availableSlots: 5,
            sessionTypes: ['Individuel', 'Collectif'],
            certifications: ['FFT', 'FIP'],
          ),
          onTap: () => _showCoachDetails(context),
          onBook: () => _bookSession(),
        ),
        _CoachCard(
          coach: Coach(
            id: '2',
            name: 'Marie Koné',
            title: 'Coach Pro WPT',
            specialty: 'Préparation physique',
            experience: '12 ans d\'expérience',
            rating: 4.8,
            reviewCount: 89,
            pricePerHour: '35 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
            availableSlots: 3,
            sessionTypes: ['Individuel', 'Perfectionnement'],
            certifications: ['WPT', 'FIP', 'Prépa Physique'],
          ),
          onTap: () => _showCoachDetails(context),
          onBook: () => _bookSession(),
        ),
        _CoachCard(
          coach: Coach(
            id: '3',
            name: 'Jean-Pierre Aka',
            title: 'Coach Initiation',
            specialty: 'Débutants & Juniors',
            experience: '5 ans d\'expérience',
            rating: 4.7,
            reviewCount: 64,
            pricePerHour: '15 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            availableSlots: 8,
            sessionTypes: ['Collectif', 'Initiation'],
            certifications: ['FFT'],
          ),
          onTap: () => _showCoachDetails(context),
          onBook: () => _bookSession(),
        ),
        _CoachCard(
          coach: Coach(
            id: '4',
            name: 'Sophie Martin',
            title: 'Coach Elite',
            specialty: 'Compétition & Mental',
            experience: '15 ans d\'expérience',
            rating: 5.0,
            reviewCount: 203,
            pricePerHour: '50 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
            availableSlots: 2,
            sessionTypes: ['Individuel', 'Perfectionnement'],
            certifications: ['WPT', 'FIP', 'Mental Coach'],
          ),
          onTap: () => _showCoachDetails(context),
          onBook: () => _bookSession(),
        ),
      ],
    );
  }

  Widget _buildMySessionsList() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _SessionCard(
          session: CoachingSession(
            id: '1',
            coachName: 'Alexandre Dupont',
            coachImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
            date: '10 Jan 2026',
            time: '14:00 - 15:00',
            location: 'PadelHouse Cocody - Terrain 2',
            sessionType: 'Individuel',
            status: SessionStatus.confirmed,
            price: '25 000 F',
          ),
          onTap: () => _showSessionDetails(context),
          onCancel: () => _cancelSession(),
        ),
        _SessionCard(
          session: CoachingSession(
            id: '2',
            coachName: 'Marie Koné',
            coachImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
            date: '15 Jan 2026',
            time: '10:00 - 11:30',
            location: 'PadelHouse Cocody - Terrain 1',
            sessionType: 'Perfectionnement',
            status: SessionStatus.pending,
            price: '52 500 F',
          ),
          onTap: () => _showSessionDetails(context),
          onCancel: () => _cancelSession(),
        ),
      ],
    );
  }

  Widget _buildHistoryList() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _SessionCard(
          session: CoachingSession(
            id: '3',
            coachName: 'Jean-Pierre Aka',
            coachImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            date: '28 Déc 2025',
            time: '16:00 - 17:00',
            location: 'PadelHouse Cocody - Terrain 3',
            sessionType: 'Initiation',
            status: SessionStatus.completed,
            price: '15 000 F',
          ),
          onTap: () => _showSessionDetails(context),
          onRate: () => _rateSession(),
        ),
        _SessionCard(
          session: CoachingSession(
            id: '4',
            coachName: 'Alexandre Dupont',
            coachImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
            date: '20 Déc 2025',
            time: '09:00 - 10:00',
            location: 'PadelHouse Cocody - Terrain 2',
            sessionType: 'Individuel',
            status: SessionStatus.completed,
            price: '25 000 F',
            userRating: 5,
          ),
          onTap: () => _showSessionDetails(context),
        ),
      ],
    );
  }

  void _showCoachDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _CoachDetailsSheet(
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _showSessionDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => const _SessionDetailsSheet(),
    );
  }

  void _bookSession() {
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
        child: const _BookSessionSheet(),
      ),
    );
  }

  void _cancelSession() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annuler la séance'),
        content: const Text(
          'Êtes-vous sûr de vouloir annuler cette séance de coaching ? '
          'L\'annulation est gratuite jusqu\'à 24h avant la séance.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Non'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Séance annulée avec succès'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: Text('Oui, annuler', style: TextStyle(color: AppColors.white)),
          ),
        ],
      ),
    );
  }

  void _rateSession() {
    showDialog(
      context: context,
      builder: (context) => _RatingDialog(),
    );
  }
}

// Coach model
class Coach {
  final String id;
  final String name;
  final String title;
  final String specialty;
  final String experience;
  final double rating;
  final int reviewCount;
  final String pricePerHour;
  final String imageUrl;
  final int availableSlots;
  final List<String> sessionTypes;
  final List<String> certifications;

  Coach({
    required this.id,
    required this.name,
    required this.title,
    required this.specialty,
    required this.experience,
    required this.rating,
    required this.reviewCount,
    required this.pricePerHour,
    required this.imageUrl,
    required this.availableSlots,
    required this.sessionTypes,
    required this.certifications,
  });
}

// Session model
enum SessionStatus { pending, confirmed, completed, cancelled }

class CoachingSession {
  final String id;
  final String coachName;
  final String coachImage;
  final String date;
  final String time;
  final String location;
  final String sessionType;
  final SessionStatus status;
  final String price;
  final int? userRating;

  CoachingSession({
    required this.id,
    required this.coachName,
    required this.coachImage,
    required this.date,
    required this.time,
    required this.location,
    required this.sessionType,
    required this.status,
    required this.price,
    this.userRating,
  });
}

// Coach Card Widget
class _CoachCard extends StatelessWidget {
  const _CoachCard({
    required this.coach,
    required this.onTap,
    this.onBook,
  });

  final Coach coach;
  final VoidCallback onTap;
  final VoidCallback? onBook;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
        boxShadow: AppShadows.cardShadow,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Coach header row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Coach photo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        borderRadius: AppRadius.borderRadiusMd,
                        boxShadow: AppShadows.cardShadow,
                      ),
                      child: ClipRRect(
                        borderRadius: AppRadius.borderRadiusMd,
                        child: Image.network(
                          coach.imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.surfaceSubtle,
                            child: Icon(Icons.person, size: 32, color: AppColors.iconTertiary),
                          ),
                        ),
                      ),
                    ),
                    AppSpacing.hGapMd,
                    // Coach info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  coach.name,
                                  style: AppTypography.titleMedium.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              // Certification badges
                              ...coach.certifications.take(2).map((cert) => Container(
                                margin: const EdgeInsets.only(left: 4),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.xs,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.brandPrimary.withValues(alpha: 0.1),
                                  borderRadius: AppRadius.borderRadiusSm,
                                ),
                                child: Text(
                                  cert,
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.brandPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 10,
                                  ),
                                ),
                              )),
                            ],
                          ),
                          AppSpacing.vGapXxs,
                          Text(
                            coach.title,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.brandPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          AppSpacing.vGapXxs,
                          Text(
                            coach.specialty,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          AppSpacing.vGapXs,
                          // Rating
                          Row(
                            children: [
                              Icon(Icons.star, size: 16, color: AppColors.warning),
                              AppSpacing.hGapXxs,
                              Text(
                                coach.rating.toString(),
                                style: AppTypography.labelMedium.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              AppSpacing.hGapXxs,
                              Text(
                                '(${coach.reviewCount} avis)',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                AppSpacing.vGapMd,

                // Divider
                Divider(color: AppColors.borderDefault, height: 1),
                AppSpacing.vGapMd,

                // Bottom info row
                Row(
                  children: [
                    // Experience
                    Row(
                      children: [
                        Icon(Icons.workspace_premium, size: 14, color: AppColors.textSecondary),
                        AppSpacing.hGapXxs,
                        Text(
                          coach.experience,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Available slots
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: coach.availableSlots > 0
                            ? AppColors.success.withValues(alpha: 0.1)
                            : AppColors.error.withValues(alpha: 0.1),
                        borderRadius: AppRadius.borderRadiusFull,
                      ),
                      child: Text(
                        coach.availableSlots > 0
                            ? '${coach.availableSlots} créneaux dispo'
                            : 'Complet',
                        style: AppTypography.caption.copyWith(
                          color: coach.availableSlots > 0 ? AppColors.success : AppColors.error,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                AppSpacing.vGapMd,

                // Session types and price row
                Row(
                  children: [
                    // Session type tags
                    Expanded(
                      child: Wrap(
                        spacing: AppSpacing.xs,
                        children: coach.sessionTypes.map((type) => AppBadge(
                          label: type,
                          variant: AppBadgeVariant.info,
                        )).toList(),
                      ),
                    ),
                    // Price
                    Text(
                      '${coach.pricePerHour}/h',
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                // Book button
                if (coach.availableSlots > 0 && onBook != null) ...[
                  AppSpacing.vGapMd,
                  AppButton(
                    label: 'Réserver une séance',
                    isFullWidth: true,
                    onPressed: onBook!,
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

// Session Card Widget
class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.session,
    required this.onTap,
    this.onCancel,
    this.onRate,
  });

  final CoachingSession session;
  final VoidCallback onTap;
  final VoidCallback? onCancel;
  final VoidCallback? onRate;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
        boxShadow: AppShadows.cardShadow,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with coach info and status
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundImage: NetworkImage(session.coachImage),
                      onBackgroundImageError: (_, __) {},
                      backgroundColor: AppColors.surfaceSubtle,
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            session.coachName,
                            style: AppTypography.titleSmall.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          AppSpacing.vGapXxs,
                          AppBadge(
                            label: session.sessionType,
                            variant: AppBadgeVariant.info,
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(),
                  ],
                ),
                AppSpacing.vGapMd,

                // Session details
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondary),
                          AppSpacing.hGapXs,
                          Text(
                            session.date,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          AppSpacing.hGapLg,
                          Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                          AppSpacing.hGapXs,
                          Text(
                            session.time,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.vGapSm,
                      Row(
                        children: [
                          Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                          AppSpacing.hGapXs,
                          Expanded(
                            child: Text(
                              session.location,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                AppSpacing.vGapMd,

                // Price and actions row
                Row(
                  children: [
                    Text(
                      session.price,
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    // User rating if completed
                    if (session.status == SessionStatus.completed && session.userRating != null)
                      Row(
                        children: List.generate(5, (index) => Icon(
                          index < session.userRating! ? Icons.star : Icons.star_border,
                          size: 16,
                          color: AppColors.warning,
                        )),
                      ),
                    // Cancel button for pending/confirmed
                    if ((session.status == SessionStatus.pending ||
                        session.status == SessionStatus.confirmed) &&
                        onCancel != null)
                      TextButton(
                        onPressed: onCancel,
                        child: Text(
                          'Annuler',
                          style: TextStyle(color: AppColors.error),
                        ),
                      ),
                    // Rate button for completed without rating
                    if (session.status == SessionStatus.completed &&
                        session.userRating == null &&
                        onRate != null)
                      AppButton(
                        label: 'Noter',
                        variant: AppButtonVariant.outline,
                        size: AppButtonSize.small,
                        onPressed: onRate!,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    Color color;
    String label;
    IconData icon;

    switch (session.status) {
      case SessionStatus.pending:
        color = AppColors.warning;
        label = 'En attente';
        icon = Icons.hourglass_empty;
        break;
      case SessionStatus.confirmed:
        color = AppColors.success;
        label = 'Confirmée';
        icon = Icons.check_circle;
        break;
      case SessionStatus.completed:
        color = AppColors.brandPrimary;
        label = 'Terminée';
        icon = Icons.done_all;
        break;
      case SessionStatus.cancelled:
        color = AppColors.error;
        label = 'Annulée';
        icon = Icons.cancel;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: AppRadius.borderRadiusFull,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          AppSpacing.hGapXxs,
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

// Coach Details Sheet
class _CoachDetailsSheet extends StatelessWidget {
  const _CoachDetailsSheet({required this.scrollController});

  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Handle
        Container(
          margin: const EdgeInsets.only(top: AppSpacing.sm),
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: AppColors.borderDefault,
            borderRadius: AppRadius.borderRadiusFull,
          ),
        ),

        Expanded(
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              // Coach header
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      borderRadius: AppRadius.borderRadiusMd,
                      boxShadow: AppShadows.cardShadow,
                    ),
                    child: ClipRRect(
                      borderRadius: AppRadius.borderRadiusMd,
                      child: Image.network(
                        'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  AppSpacing.hGapLg,
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Alexandre Dupont',
                          style: AppTypography.headlineSmall.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        AppSpacing.vGapXs,
                        Text(
                          'Coach Certifié FFT',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.brandPrimary,
                          ),
                        ),
                        AppSpacing.vGapSm,
                        Row(
                          children: [
                            Icon(Icons.star, size: 18, color: AppColors.warning),
                            AppSpacing.hGapXxs,
                            Text(
                              '4.9',
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            AppSpacing.hGapXs,
                            Text(
                              '(127 avis)',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              AppSpacing.vGapXl,

              // Quick stats
              Row(
                children: [
                  Expanded(child: _StatCard(icon: Icons.workspace_premium, label: 'Expérience', value: '8 ans')),
                  AppSpacing.hGapMd,
                  Expanded(child: _StatCard(icon: Icons.people, label: 'Élèves', value: '250+')),
                ],
              ),
              AppSpacing.vGapMd,
              Row(
                children: [
                  Expanded(child: _StatCard(icon: Icons.sports_tennis, label: 'Séances', value: '1200+')),
                  AppSpacing.hGapMd,
                  Expanded(child: _StatCard(icon: Icons.euro, label: 'Tarif', value: '25 000 F/h')),
                ],
              ),

              AppSpacing.vGapXl,

              // Certifications
              Text(
                'Certifications',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapMd,
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: ['FFT Niveau 3', 'FIP Coach', 'Formation Prépa Mentale'].map((cert) => Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withValues(alpha: 0.1),
                    borderRadius: AppRadius.borderRadiusFull,
                    border: Border.all(color: AppColors.brandPrimary.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified, size: 16, color: AppColors.brandPrimary),
                      AppSpacing.hGapXs,
                      Text(
                        cert,
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.brandPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                )).toList(),
              ),

              AppSpacing.vGapXl,

              // About
              Text(
                'À propos',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapSm,
              Text(
                'Passionné de padel depuis plus de 10 ans, j\'ai eu la chance de me former auprès des meilleurs coachs européens. '
                'Ma méthode d\'enseignement combine technique, tactique et préparation mentale pour vous aider à progresser rapidement. '
                'Je m\'adapte à tous les niveaux, du débutant complet au joueur confirmé souhaitant perfectionner son jeu.',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
              ),

              AppSpacing.vGapXl,

              // Specialties
              Text(
                'Spécialités',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapMd,
              ...[
                {'icon': Icons.precision_manufacturing, 'title': 'Technique de frappe', 'desc': 'Amélioration de vos coups de base et avancés'},
                {'icon': Icons.psychology, 'title': 'Tactique de jeu', 'desc': 'Stratégies pour dominer vos adversaires'},
                {'icon': Icons.sports, 'title': 'Jeu au filet', 'desc': 'Maîtrise des volées et du smash'},
              ].map((specialty) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary.withValues(alpha: 0.1),
                        borderRadius: AppRadius.borderRadiusMd,
                      ),
                      child: Icon(specialty['icon'] as IconData, color: AppColors.brandPrimary, size: 20),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            specialty['title'] as String,
                            style: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            specialty['desc'] as String,
                            style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),

              AppSpacing.vGapXl,

              // Availability
              Text(
                'Disponibilités cette semaine',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapMd,
              SizedBox(
                height: 80,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _AvailabilitySlot(day: 'Lun', date: '6', slots: 3),
                    _AvailabilitySlot(day: 'Mar', date: '7', slots: 0),
                    _AvailabilitySlot(day: 'Mer', date: '8', slots: 2),
                    _AvailabilitySlot(day: 'Jeu', date: '9', slots: 4),
                    _AvailabilitySlot(day: 'Ven', date: '10', slots: 1),
                    _AvailabilitySlot(day: 'Sam', date: '11', slots: 5),
                    _AvailabilitySlot(day: 'Dim', date: '12', slots: 0),
                  ],
                ),
              ),

              AppSpacing.vGapXl,

              // Reviews preview
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Avis récents',
                    style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text('Voir tous'),
                  ),
                ],
              ),
              AppSpacing.vGapSm,
              _ReviewCard(
                name: 'Konan M.',
                rating: 5,
                date: 'Il y a 3 jours',
                comment: 'Excellent coach ! J\'ai énormément progressé en seulement quelques séances. Très pédagogue et patient.',
              ),
              _ReviewCard(
                name: 'Fatou D.',
                rating: 5,
                date: 'Il y a 1 semaine',
                comment: 'Alexandre m\'a aidé à corriger ma prise de raquette et mon service. Je recommande vivement !',
              ),

              AppSpacing.vGapXxl,

              // CTA
              AppButton(
                label: 'Réserver une séance - 25 000 F/h',
                isFullWidth: true,
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
              AppSpacing.vGapMd,
              AppButton(
                label: 'Contacter',
                variant: AppButtonVariant.outline,
                icon: Icons.message,
                isFullWidth: true,
                onPressed: () {},
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: AppColors.brandPrimary),
              AppSpacing.hGapXs,
              Text(
                label,
                style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
          AppSpacing.vGapXs,
          Text(
            value,
            style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

class _AvailabilitySlot extends StatelessWidget {
  const _AvailabilitySlot({
    required this.day,
    required this.date,
    required this.slots,
  });

  final String day;
  final String date;
  final int slots;

  @override
  Widget build(BuildContext context) {
    final isAvailable = slots > 0;
    return Container(
      width: 60,
      margin: const EdgeInsets.only(right: AppSpacing.sm),
      decoration: BoxDecoration(
        color: isAvailable ? AppColors.brandPrimary.withValues(alpha: 0.1) : AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
        border: Border.all(
          color: isAvailable ? AppColors.brandPrimary.withValues(alpha: 0.3) : AppColors.borderDefault,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            day,
            style: AppTypography.caption.copyWith(
              color: isAvailable ? AppColors.brandPrimary : AppColors.textTertiary,
            ),
          ),
          Text(
            date,
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: isAvailable ? AppColors.brandPrimary : AppColors.textTertiary,
            ),
          ),
          Text(
            isAvailable ? '$slots dispo' : 'Complet',
            style: AppTypography.caption.copyWith(
              color: isAvailable ? AppColors.success : AppColors.textTertiary,
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({
    required this.name,
    required this.rating,
    required this.date,
    required this.comment,
  });

  final String name;
  final int rating;
  final String date;
  final String comment;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.brandPrimary.withValues(alpha: 0.2),
                child: Text(
                  name[0],
                  style: TextStyle(
                    color: AppColors.brandPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              AppSpacing.hGapSm,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTypography.labelMedium),
                    Text(date, style: AppTypography.caption.copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ),
              Row(
                children: List.generate(5, (index) => Icon(
                  index < rating ? Icons.star : Icons.star_border,
                  size: 14,
                  color: AppColors.warning,
                )),
              ),
            ],
          ),
          AppSpacing.vGapSm,
          Text(
            comment,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

// Session Details Sheet
class _SessionDetailsSheet extends StatelessWidget {
  const _SessionDetailsSheet();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderDefault,
                borderRadius: AppRadius.borderRadiusFull,
              ),
            ),
          ),
          AppSpacing.vGapLg,

          Text(
            'Détails de la séance',
            style: AppTypography.headlineSmall,
          ),
          AppSpacing.vGapLg,

          // Coach info
          Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundImage: NetworkImage(
                  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Alexandre Dupont', style: AppTypography.titleMedium),
                    Text(
                      'Coach Certifié FFT',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: AppRadius.borderRadiusFull,
                ),
                child: Text(
                  'Confirmée',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),

          AppSpacing.vGapLg,

          // Session info cards
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surfaceSubtle,
              borderRadius: AppRadius.borderRadiusMd,
            ),
            child: Column(
              children: [
                _DetailRow(icon: Icons.calendar_today, label: 'Date', value: '10 Janvier 2026'),
                AppSpacing.vGapMd,
                _DetailRow(icon: Icons.access_time, label: 'Horaire', value: '14:00 - 15:00'),
                AppSpacing.vGapMd,
                _DetailRow(icon: Icons.location_on, label: 'Lieu', value: 'PadelHouse Cocody - Terrain 2'),
                AppSpacing.vGapMd,
                _DetailRow(icon: Icons.sports_tennis, label: 'Type', value: 'Séance individuelle'),
              ],
            ),
          ),

          AppSpacing.vGapLg,

          // Price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: AppTypography.titleMedium),
              Text(
                '25 000 F',
                style: AppTypography.headlineSmall.copyWith(
                  color: AppColors.brandPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          AppSpacing.vGapXl,

          // Actions
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Contacter',
                  variant: AppButtonVariant.outline,
                  icon: Icons.message,
                  onPressed: () {},
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: AppButton(
                  label: 'Annuler',
                  variant: AppButtonVariant.outline,
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ],
          ),
          AppSpacing.vGapLg,
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.brandPrimary),
        AppSpacing.hGapMd,
        Text(label, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
        const Spacer(),
        Text(value, style: AppTypography.labelMedium),
      ],
    );
  }
}

// Book Session Sheet
class _BookSessionSheet extends StatefulWidget {
  const _BookSessionSheet();

  @override
  State<_BookSessionSheet> createState() => _BookSessionSheetState();
}

class _BookSessionSheetState extends State<_BookSessionSheet> {
  String _selectedType = 'Individuel';
  String _selectedDate = '';
  String _selectedTime = '';

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
              'Réserver une séance',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapSm,
            Text(
              'Avec Alexandre Dupont',
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
            AppSpacing.vGapLg,

            // Session type
            Text('Type de séance', style: AppTypography.labelLarge),
            AppSpacing.vGapSm,
            Row(
              children: ['Individuel', 'Collectif'].map((type) {
                final isSelected = _selectedType == type;
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: type == 'Individuel' ? AppSpacing.sm : 0),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedType = type),
                      child: Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.brandPrimary.withValues(alpha: 0.1) : AppColors.surfaceSubtle,
                          borderRadius: AppRadius.borderRadiusMd,
                          border: Border.all(
                            color: isSelected ? AppColors.brandPrimary : AppColors.borderDefault,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              type == 'Individuel' ? Icons.person : Icons.people,
                              color: isSelected ? AppColors.brandPrimary : AppColors.textSecondary,
                            ),
                            AppSpacing.vGapXs,
                            Text(
                              type,
                              style: AppTypography.labelMedium.copyWith(
                                color: isSelected ? AppColors.brandPrimary : AppColors.textPrimary,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            Text(
                              type == 'Individuel' ? '25 000 F/h' : '15 000 F/h',
                              style: AppTypography.caption.copyWith(
                                color: isSelected ? AppColors.brandPrimary : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            AppSpacing.vGapLg,

            // Date selection
            Text('Sélectionner une date', style: AppTypography.labelLarge),
            AppSpacing.vGapSm,
            SizedBox(
              height: 70,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 7,
                itemBuilder: (context, index) {
                  final days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                  final dates = ['6', '7', '8', '9', '10', '11', '12'];
                  final date = '${dates[index]} Jan';
                  final isSelected = _selectedDate == date;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDate = date),
                    child: Container(
                      width: 55,
                      margin: const EdgeInsets.only(right: AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.brandPrimary : AppColors.surfaceSubtle,
                        borderRadius: AppRadius.borderRadiusMd,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            days[index],
                            style: AppTypography.caption.copyWith(
                              color: isSelected ? AppColors.white : AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            dates[index],
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.bold,
                              color: isSelected ? AppColors.white : AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            AppSpacing.vGapLg,

            // Time selection
            Text('Sélectionner un horaire', style: AppTypography.labelLarge),
            AppSpacing.vGapSm,
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) {
                final isSelected = _selectedTime == time;
                return GestureDetector(
                  onTap: () => setState(() => _selectedTime = time),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.brandPrimary : AppColors.surfaceSubtle,
                      borderRadius: AppRadius.borderRadiusMd,
                    ),
                    child: Text(
                      time,
                      style: AppTypography.labelMedium.copyWith(
                        color: isSelected ? AppColors.white : AppColors.textPrimary,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            AppSpacing.vGapXl,

            // Summary
            if (_selectedDate.isNotEmpty && _selectedTime.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppRadius.borderRadiusMd,
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Séance $_selectedType'),
                        Text(_selectedType == 'Individuel' ? '25 000 F' : '15 000 F'),
                      ],
                    ),
                    AppSpacing.vGapXs,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '$_selectedDate à $_selectedTime',
                          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                        ),
                        Text(
                          '1h',
                          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            AppSpacing.vGapLg,

            AppButton(
              label: 'Confirmer la réservation',
              isFullWidth: true,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Réservation confirmée ! Vous recevrez un email de confirmation.'),
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

// Rating Dialog
class _RatingDialog extends StatefulWidget {
  @override
  State<_RatingDialog> createState() => _RatingDialogState();
}

class _RatingDialogState extends State<_RatingDialog> {
  int _rating = 0;
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Noter votre séance'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Comment s\'est passée votre séance avec Jean-Pierre Aka ?'),
          AppSpacing.vGapMd,
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) => GestureDetector(
              onTap: () => setState(() => _rating = index + 1),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Icon(
                  index < _rating ? Icons.star : Icons.star_border,
                  size: 36,
                  color: AppColors.warning,
                ),
              ),
            )),
          ),
          AppSpacing.vGapMd,
          TextField(
            controller: _commentController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Votre commentaire (optionnel)',
              border: OutlineInputBorder(borderRadius: AppRadius.borderRadiusMd),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: _rating > 0 ? () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Merci pour votre avis !'),
                backgroundColor: AppColors.success,
              ),
            );
          } : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.brandPrimary,
          ),
          child: Text('Envoyer', style: TextStyle(color: AppColors.white)),
        ),
      ],
    );
  }
}

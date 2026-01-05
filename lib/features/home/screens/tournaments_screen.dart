import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class TournamentsScreen extends StatefulWidget {
  const TournamentsScreen({super.key});

  @override
  State<TournamentsScreen> createState() => _TournamentsScreenState();
}

class _TournamentsScreenState extends State<TournamentsScreen> with SingleTickerProviderStateMixin {
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
          'Tournois',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.brandPrimary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.brandPrimary,
          tabs: const [
            Tab(text: 'À venir'),
            Tab(text: 'En cours'),
            Tab(text: 'Passés'),
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
              children: ['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Pro'].map((filter) {
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
                _buildUpcomingTournaments(),
                _buildOngoingTournaments(),
                _buildPastTournaments(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateTournamentSheet(),
        backgroundColor: AppColors.brandPrimary,
        icon: Icon(Icons.add, color: AppColors.white),
        label: Text(
          'Créer',
          style: TextStyle(color: AppColors.white),
        ),
      ),
    );
  }

  Widget _buildUpcomingTournaments() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _TournamentCard(
          tournament: Tournament(
            id: '1',
            name: 'Tournoi Amical du Weekend',
            date: '18 Jan 2026',
            time: '09:00 - 18:00',
            location: 'PadelHouse Cocody',
            level: 'Tous niveaux',
            spots: 16,
            spotsRemaining: 4,
            prizePool: '500 000 F',
            entryFee: '15 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',
            status: TournamentStatus.upcoming,
          ),
          onTap: () => _showTournamentDetails(context),
          onRegister: () => _registerForTournament(),
        ),
        _TournamentCard(
          tournament: Tournament(
            id: '2',
            name: 'Championnat Intermédiaire',
            date: '25 Jan 2026',
            time: '10:00 - 19:00',
            location: 'PadelHouse Cocody',
            level: 'Intermédiaire',
            spots: 24,
            spotsRemaining: 8,
            prizePool: '1 000 000 F',
            entryFee: '25 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
            status: TournamentStatus.upcoming,
          ),
          onTap: () => _showTournamentDetails(context),
          onRegister: () => _registerForTournament(),
        ),
        _TournamentCard(
          tournament: Tournament(
            id: '3',
            name: 'Coupe PadelHouse 2026',
            date: '1-2 Fév 2026',
            time: '08:00 - 20:00',
            location: 'PadelHouse Cocody',
            level: 'Avancé',
            spots: 32,
            spotsRemaining: 12,
            prizePool: '2 500 000 F',
            entryFee: '50 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
            status: TournamentStatus.upcoming,
          ),
          onTap: () => _showTournamentDetails(context),
          onRegister: () => _registerForTournament(),
        ),
      ],
    );
  }

  Widget _buildOngoingTournaments() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _TournamentCard(
          tournament: Tournament(
            id: '4',
            name: 'Tournoi Express Janvier',
            date: '4 Jan 2026',
            time: '14:00 - 20:00',
            location: 'PadelHouse Cocody',
            level: 'Débutant',
            spots: 8,
            spotsRemaining: 0,
            prizePool: '200 000 F',
            entryFee: '10 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
            status: TournamentStatus.ongoing,
            currentRound: 'Demi-finales',
          ),
          onTap: () => _showTournamentDetails(context),
        ),
      ],
    );
  }

  Widget _buildPastTournaments() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      children: [
        _TournamentCard(
          tournament: Tournament(
            id: '5',
            name: 'Tournoi de Noël 2025',
            date: '25 Déc 2025',
            time: '10:00 - 18:00',
            location: 'PadelHouse Cocody',
            level: 'Tous niveaux',
            spots: 16,
            spotsRemaining: 0,
            prizePool: '750 000 F',
            entryFee: '20 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&q=80',
            status: TournamentStatus.completed,
            winner: 'Équipe Alpha',
          ),
          onTap: () => _showTournamentDetails(context),
        ),
        _TournamentCard(
          tournament: Tournament(
            id: '6',
            name: 'Open de Décembre',
            date: '15 Déc 2025',
            time: '09:00 - 17:00',
            location: 'PadelHouse Cocody',
            level: 'Intermédiaire',
            spots: 12,
            spotsRemaining: 0,
            prizePool: '500 000 F',
            entryFee: '15 000 F',
            imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
            status: TournamentStatus.completed,
            winner: 'Équipe Gamma',
          ),
          onTap: () => _showTournamentDetails(context),
        ),
      ],
    );
  }

  void _showTournamentDetails(BuildContext context) {
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
        builder: (context, scrollController) => _TournamentDetailsSheet(
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _registerForTournament() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Inscription au tournoi'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vous êtes sur le point de vous inscrire à ce tournoi.'),
            AppSpacing.vGapMd,
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
                      Text('Frais d\'inscription'),
                      Text('15 000 F', style: AppTypography.labelLarge),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Inscription réussie ! Vous recevrez un email de confirmation.'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandPrimary,
            ),
            child: Text('Confirmer', style: TextStyle(color: AppColors.white)),
          ),
        ],
      ),
    );
  }

  void _showCreateTournamentSheet() {
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
        child: const _CreateTournamentSheet(),
      ),
    );
  }
}

// Tournament model
enum TournamentStatus { upcoming, ongoing, completed }

class Tournament {
  final String id;
  final String name;
  final String date;
  final String time;
  final String location;
  final String level;
  final int spots;
  final int spotsRemaining;
  final String prizePool;
  final String entryFee;
  final String imageUrl;
  final TournamentStatus status;
  final String? currentRound;
  final String? winner;

  Tournament({
    required this.id,
    required this.name,
    required this.date,
    required this.time,
    required this.location,
    required this.level,
    required this.spots,
    required this.spotsRemaining,
    required this.prizePool,
    required this.entryFee,
    required this.imageUrl,
    required this.status,
    this.currentRound,
    this.winner,
  });
}

// Tournament Card Widget
class _TournamentCard extends StatelessWidget {
  const _TournamentCard({
    required this.tournament,
    required this.onTap,
    this.onRegister,
  });

  final Tournament tournament;
  final VoidCallback onTap;
  final VoidCallback? onRegister;

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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image header
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppRadius.card),
                    ),
                    child: Image.network(
                      tournament.imageUrl,
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 140,
                        color: AppColors.surfaceSubtle,
                        child: Icon(Icons.emoji_events, size: 48, color: AppColors.iconTertiary),
                      ),
                    ),
                  ),
                  // Status badge
                  Positioned(
                    top: AppSpacing.sm,
                    left: AppSpacing.sm,
                    child: _buildStatusBadge(),
                  ),
                  // Prize pool badge
                  Positioned(
                    top: AppSpacing.sm,
                    right: AppSpacing.sm,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.warning,
                        borderRadius: AppRadius.borderRadiusFull,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.emoji_events, size: 14, color: AppColors.white),
                          AppSpacing.hGapXxs,
                          Text(
                            tournament.prizePool,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // Content
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tournament.name,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    AppSpacing.vGapSm,

                    // Info row
                    Row(
                      children: [
                        Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondary),
                        AppSpacing.hGapXxs,
                        Text(
                          tournament.date,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        AppSpacing.hGapMd,
                        Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                        AppSpacing.hGapXxs,
                        Text(
                          tournament.time,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.vGapXs,

                    Row(
                      children: [
                        Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                        AppSpacing.hGapXxs,
                        Text(
                          tournament.location,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.vGapMd,

                    // Tags and spots
                    Row(
                      children: [
                        AppBadge(
                          label: tournament.level,
                          variant: AppBadgeVariant.info,
                        ),
                        AppSpacing.hGapSm,
                        if (tournament.status == TournamentStatus.upcoming)
                          Text(
                            '${tournament.spotsRemaining}/${tournament.spots} places',
                            style: AppTypography.caption.copyWith(
                              color: tournament.spotsRemaining > 0
                                  ? AppColors.success
                                  : AppColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        if (tournament.status == TournamentStatus.ongoing && tournament.currentRound != null)
                          AppBadge(
                            label: tournament.currentRound!,
                            variant: AppBadgeVariant.warning,
                          ),
                        if (tournament.status == TournamentStatus.completed && tournament.winner != null)
                          Row(
                            children: [
                              Icon(Icons.emoji_events, size: 14, color: AppColors.warning),
                              AppSpacing.hGapXxs,
                              Text(
                                tournament.winner!,
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        const Spacer(),
                        Text(
                          tournament.entryFee,
                          style: AppTypography.labelLarge.copyWith(
                            color: AppColors.brandPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),

                    // Register button for upcoming tournaments
                    if (tournament.status == TournamentStatus.upcoming && 
                        tournament.spotsRemaining > 0 &&
                        onRegister != null) ...[
                      AppSpacing.vGapMd,
                      AppButton(
                        label: 'S\'inscrire',
                        isFullWidth: true,
                        onPressed: onRegister!,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    Color color;
    String label;
    IconData icon;

    switch (tournament.status) {
      case TournamentStatus.upcoming:
        color = AppColors.brandSecondary;
        label = 'À venir';
        icon = Icons.event;
        break;
      case TournamentStatus.ongoing:
        color = AppColors.success;
        label = 'En cours';
        icon = Icons.play_arrow;
        break;
      case TournamentStatus.completed:
        color = AppColors.textTertiary;
        label = 'Terminé';
        icon = Icons.check_circle;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: AppRadius.borderRadiusFull,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.white),
          AppSpacing.hGapXxs,
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

// Tournament Details Sheet
class _TournamentDetailsSheet extends StatelessWidget {
  const _TournamentDetailsSheet({required this.scrollController});

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
              // Header image
              ClipRRect(
                borderRadius: AppRadius.cardBorderRadius,
                child: Image.network(
                  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              AppSpacing.vGapLg,

              // Title
              Text(
                'Tournoi Amical du Weekend',
                style: AppTypography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              AppSpacing.vGapMd,

              // Quick info cards
              Row(
                children: [
                  Expanded(child: _InfoCard(icon: Icons.calendar_today, label: 'Date', value: '18 Jan 2026')),
                  AppSpacing.hGapMd,
                  Expanded(child: _InfoCard(icon: Icons.access_time, label: 'Heure', value: '09:00 - 18:00')),
                ],
              ),
              AppSpacing.vGapMd,
              Row(
                children: [
                  Expanded(child: _InfoCard(icon: Icons.people, label: 'Places', value: '4/16 restantes')),
                  AppSpacing.hGapMd,
                  Expanded(child: _InfoCard(icon: Icons.emoji_events, label: 'Prix', value: '500 000 F')),
                ],
              ),

              AppSpacing.vGapXl,

              // Description
              Text(
                'Description',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapSm,
              Text(
                'Rejoignez-nous pour un tournoi amical ouvert à tous les niveaux ! Format en double, matchs de poules puis phases finales à élimination directe. Ambiance conviviale garantie.',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),

              AppSpacing.vGapXl,

              // Rules
              Text(
                'Règlement',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapSm,
              ...[
                'Format en double (équipes de 2 joueurs)',
                'Phase de poules puis élimination directe',
                'Matchs en 1 set gagnant (tie-break à 6-6)',
                'Équipement fourni (balles officielles)',
                'Rafraîchissements offerts aux participants',
              ].map((rule) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle, size: 16, color: AppColors.success),
                    AppSpacing.hGapSm,
                    Expanded(
                      child: Text(
                        rule,
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              )),

              AppSpacing.vGapXl,

              // Registered teams preview
              Text(
                'Équipes inscrites (12/16)',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              AppSpacing.vGapMd,
              SizedBox(
                height: 60,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: 12,
                  itemBuilder: (context, index) => Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.brandPrimary.withValues(alpha: 0.1),
                          child: Text(
                            'E${index + 1}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.brandPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        AppSpacing.vGapXxs,
                        Text(
                          'Équipe ${index + 1}',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              AppSpacing.vGapXxl,

              // CTA
              AppButton(
                label: 'S\'inscrire - 15 000 F',
                isFullWidth: true,
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Inscription réussie !'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
              ),
              AppSpacing.vGapMd,
              AppButton(
                label: 'Partager',
                variant: AppButtonVariant.outline,
                icon: Icons.share,
                isFullWidth: true,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Lien copié dans le presse-papier'),
                      backgroundColor: AppColors.brandPrimary,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
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
            style: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

// Create Tournament Sheet
class _CreateTournamentSheet extends StatefulWidget {
  const _CreateTournamentSheet();

  @override
  State<_CreateTournamentSheet> createState() => _CreateTournamentSheetState();
}

class _CreateTournamentSheetState extends State<_CreateTournamentSheet> {
  final _nameController = TextEditingController();
  String _selectedLevel = 'Tous niveaux';
  String _selectedFormat = 'Double';

  @override
  void dispose() {
    _nameController.dispose();
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
              'Créer un tournoi',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapSm,
            Text(
              'Organisez votre propre tournoi de padel',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            AppSpacing.vGapLg,

            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nom du tournoi',
                border: OutlineInputBorder(borderRadius: AppRadius.borderRadiusMd),
              ),
            ),
            AppSpacing.vGapMd,

            DropdownButtonFormField<String>(
              initialValue: _selectedLevel,
              decoration: InputDecoration(
                labelText: 'Niveau',
                border: OutlineInputBorder(borderRadius: AppRadius.borderRadiusMd),
              ),
              items: ['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé', 'Pro']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedLevel = v!),
            ),
            AppSpacing.vGapMd,

            DropdownButtonFormField<String>(
              initialValue: _selectedFormat,
              decoration: InputDecoration(
                labelText: 'Format',
                border: OutlineInputBorder(borderRadius: AppRadius.borderRadiusMd),
              ),
              items: ['Simple', 'Double', 'Mixte']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedFormat = v!),
            ),

            AppSpacing.vGapLg,

            AppButton(
              label: 'Créer le tournoi',
              isFullWidth: true,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Tournoi créé ! Il sera visible après validation.'),
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

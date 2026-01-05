import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

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
          'Favoris',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.brandPrimary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.brandPrimary,
          tabs: const [
            Tab(text: 'Terrains'),
            Tab(text: 'Événements'),
            Tab(text: 'Joueurs'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCourtsTab(),
          _buildEventsTab(),
          _buildPlayersTab(),
        ],
      ),
    );
  }

  Widget _buildCourtsTab() {
    final courts = [
      _FavoriteCourt(
        name: 'Terrain A',
        location: 'PadelHouse Cocody',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
        isFavorite: true,
      ),
      _FavoriteCourt(
        name: 'Terrain B',
        location: 'PadelHouse Cocody',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80',
        isFavorite: true,
      ),
    ];

    return ListView.builder(
      padding: AppSpacing.screenPadding,
      itemCount: courts.length,
      itemBuilder: (context, index) => _FavoriteCourtCard(
        court: courts[index],
        onRemove: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${courts[index].name} retiré des favoris'),
              backgroundColor: AppColors.warning,
              action: SnackBarAction(
                label: 'Annuler',
                textColor: AppColors.white,
                onPressed: () {},
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEventsTab() {
    final events = [
      _FavoriteEvent(
        title: 'Tournoi Amical',
        date: '15 Jan 2026',
        location: 'PadelHouse Cocody',
        participants: 16,
        imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80',
      ),
      _FavoriteEvent(
        title: 'Cours Débutant',
        date: '20 Jan 2026',
        location: 'PadelHouse Cocody',
        participants: 8,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      ),
    ];

    return ListView.builder(
      padding: AppSpacing.screenPadding,
      itemCount: events.length,
      itemBuilder: (context, index) => _FavoriteEventCard(
        event: events[index],
        onRemove: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${events[index].title} retiré des favoris'),
              backgroundColor: AppColors.warning,
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlayersTab() {
    final players = [
      _FavoritePlayer(
        name: 'Julie Martin',
        level: 'Intermédiaire',
        matchesPlayed: 12,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      ),
      _FavoritePlayer(
        name: 'Marc Dubois',
        level: 'Avancé',
        matchesPlayed: 8,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      ),
      _FavoritePlayer(
        name: 'Sophie Laurent',
        level: 'Expert',
        matchesPlayed: 15,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      ),
    ];

    return ListView.builder(
      padding: AppSpacing.screenPadding,
      itemCount: players.length,
      itemBuilder: (context, index) => _FavoritePlayerCard(
        player: players[index],
        onInvite: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Invitation envoyée à ${players[index].name}'),
              backgroundColor: AppColors.success,
            ),
          );
        },
        onRemove: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${players[index].name} retiré des favoris'),
              backgroundColor: AppColors.warning,
            ),
          );
        },
      ),
    );
  }
}

// Data Models
class _FavoriteCourt {
  final String name;
  final String location;
  final double rating;
  final String imageUrl;
  final bool isFavorite;

  _FavoriteCourt({
    required this.name,
    required this.location,
    required this.rating,
    required this.imageUrl,
    required this.isFavorite,
  });
}

class _FavoriteEvent {
  final String title;
  final String date;
  final String location;
  final int participants;
  final String imageUrl;

  _FavoriteEvent({
    required this.title,
    required this.date,
    required this.location,
    required this.participants,
    required this.imageUrl,
  });
}

class _FavoritePlayer {
  final String name;
  final String level;
  final int matchesPlayed;
  final String avatarUrl;

  _FavoritePlayer({
    required this.name,
    required this.level,
    required this.matchesPlayed,
    required this.avatarUrl,
  });
}

// Card Widgets
class _FavoriteCourtCard extends StatelessWidget {
  const _FavoriteCourtCard({
    required this.court,
    required this.onRemove,
  });

  final _FavoriteCourt court;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(AppRadius.card),
              bottomLeft: Radius.circular(AppRadius.card),
            ),
            child: Image.network(
              court.imageUrl,
              width: 100,
              height: 100,
              fit: BoxFit.cover,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    court.name,
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  AppSpacing.vGapXxs,
                  Text(
                    court.location,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  AppSpacing.vGapXs,
                  Row(
                    children: [
                      Icon(Icons.star, color: AppColors.warning, size: 16),
                      AppSpacing.hGapXxs,
                      Text(
                        court.rating.toString(),
                        style: AppTypography.labelSmall.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.favorite, color: AppColors.error),
            onPressed: onRemove,
          ),
        ],
      ),
    );
  }
}

class _FavoriteEventCard extends StatelessWidget {
  const _FavoriteEventCard({
    required this.event,
    required this.onRemove,
  });

  final _FavoriteEvent event;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(AppRadius.card),
              bottomLeft: Radius.circular(AppRadius.card),
            ),
            child: Image.network(
              event.imageUrl,
              width: 100,
              height: 100,
              fit: BoxFit.cover,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  AppSpacing.vGapXxs,
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondary),
                      AppSpacing.hGapXxs,
                      Text(
                        event.date,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.vGapXxs,
                  Row(
                    children: [
                      Icon(Icons.people, size: 14, color: AppColors.textSecondary),
                      AppSpacing.hGapXxs,
                      Text(
                        '${event.participants} participants',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.favorite, color: AppColors.error),
            onPressed: onRemove,
          ),
        ],
      ),
    );
  }
}

class _FavoritePlayerCard extends StatelessWidget {
  const _FavoritePlayerCard({
    required this.player,
    required this.onInvite,
    required this.onRemove,
  });

  final _FavoritePlayer player;
  final VoidCallback onInvite;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundImage: NetworkImage(player.avatarUrl),
          ),
          AppSpacing.hGapMd,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player.name,
                  style: AppTypography.titleSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                AppSpacing.vGapXxs,
                Row(
                  children: [
                    AppBadge(
                      label: player.level,
                      variant: AppBadgeVariant.info,
                    ),
                    AppSpacing.hGapSm,
                    Text(
                      '${player.matchesPlayed} matchs ensemble',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(Icons.mail_outline, color: AppColors.brandPrimary),
                onPressed: onInvite,
                tooltip: 'Inviter à jouer',
              ),
              IconButton(
                icon: Icon(Icons.favorite, color: AppColors.error),
                onPressed: onRemove,
                tooltip: 'Retirer des favoris',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

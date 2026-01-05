import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class ReplaysScreen extends StatefulWidget {
  const ReplaysScreen({super.key});

  @override
  State<ReplaysScreen> createState() => _ReplaysScreenState();
}

class _ReplaysScreenState extends State<ReplaysScreen> {
  String _selectedFilter = 'Tous';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final List<String> _filters = ['Tous', 'Ce mois', 'Favoris', 'Partagés'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Sample replays data - in real app, this would come from a service
  final List<Replay> _replays = [
    Replay(
      id: '1',
      title: 'Match du 5 Janvier',
      date: DateTime(2026, 1, 5, 19, 0),
      duration: const Duration(hours: 1, minutes: 23),
      court: 'Terrain A',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
      players: ['Alexandre K.', 'Julie M.', 'Marc D.', 'Sophie L.'],
      score: '6-4, 7-5',
      views: 12,
      isFavorite: true,
      isShared: false,
    ),
    Replay(
      id: '2',
      title: 'Tournoi Amical - Finale',
      date: DateTime(2026, 1, 3, 15, 30),
      duration: const Duration(hours: 1, minutes: 45),
      court: 'Terrain B',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
      players: ['Alexandre K.', 'Pierre R.', 'Thomas B.', 'Lucas V.'],
      score: '6-3, 4-6, 6-2',
      views: 45,
      isFavorite: true,
      isShared: true,
    ),
    Replay(
      id: '3',
      title: 'Match Entraînement',
      date: DateTime(2025, 12, 28, 18, 0),
      duration: const Duration(minutes: 58),
      court: 'Terrain A',
      thumbnailUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
      players: ['Alexandre K.', 'Julie M.'],
      score: '6-2, 6-4',
      views: 8,
      isFavorite: false,
      isShared: false,
    ),
    Replay(
      id: '4',
      title: 'Session Cours Collectif',
      date: DateTime(2025, 12, 20, 10, 0),
      duration: const Duration(hours: 2, minutes: 10),
      court: 'Terrain C',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      players: ['Groupe Débutants'],
      score: 'Entraînement',
      views: 3,
      isFavorite: false,
      isShared: false,
    ),
  ];

  List<Replay> get _filteredReplays {
    List<Replay> results = _replays;
    
    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      results = results.where((r) =>
        r.title.toLowerCase().contains(query) ||
        r.court.toLowerCase().contains(query) ||
        r.players.any((p) => p.toLowerCase().contains(query)) ||
        r.score.toLowerCase().contains(query)
      ).toList();
    }
    
    // Apply category filter
    switch (_selectedFilter) {
      case 'Favoris':
        return results.where((r) => r.isFavorite).toList();
      case 'Partagés':
        return results.where((r) => r.isShared).toList();
      case 'Ce mois':
        final now = DateTime.now();
        return results.where((r) => 
          r.date.month == now.month && r.date.year == now.year
        ).toList();
      default:
        return results;
    }
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
          'Mes Replays',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: _replays.isEmpty ? _buildEmptyState() : _buildReplaysList(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: AppSpacing.screenPadding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: BorderRadius.circular(32),
              ),
              child: Icon(
                Icons.videocam_off_outlined,
                size: 56,
                color: AppColors.iconTertiary,
              ),
            ),
            AppSpacing.vGapXl,
            Text(
              'Aucun Replay',
              style: AppTypography.headlineSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            AppSpacing.vGapSm,
            Text(
              'Vos vidéos de matchs apparaîtront ici.\nJouez votre premier match filmé !',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            AppSpacing.vGapXl,
            AppButton(
              label: 'Réserver un terrain',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReplaysList() {
    final filteredReplays = _filteredReplays;
    
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.md),
          child: _buildSearchBar(),
        ),
        
        // Stats summary
        _buildStatsSummary(),
        
        AppSpacing.vGapMd,
        
        // Filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Row(
            children: _filters.map((filter) => Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: FilterChip(
                label: Text(filter),
                selected: _selectedFilter == filter,
                onSelected: (selected) {
                  setState(() => _selectedFilter = filter);
                },
                selectedColor: AppColors.brandPrimary.withValues(alpha: 0.2),
                checkmarkColor: AppColors.brandPrimary,
                labelStyle: TextStyle(
                  color: _selectedFilter == filter 
                      ? AppColors.brandPrimary 
                      : AppColors.textSecondary,
                  fontWeight: _selectedFilter == filter 
                      ? FontWeight.w600 
                      : FontWeight.normal,
                ),
              ),
            )).toList(),
          ),
        ),
        
        AppSpacing.vGapMd,
        
        // Replays list
        Expanded(
          child: filteredReplays.isEmpty
              ? _buildNoResultsState()
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  itemCount: filteredReplays.length,
                  itemBuilder: (context, index) => _ReplayCard(
                    replay: filteredReplays[index],
                    onTap: () => _showReplayDetails(filteredReplays[index]),
                    onFavorite: () => _toggleFavorite(filteredReplays[index]),
                    onShare: () => _shareReplay(filteredReplays[index]),
                    onMore: () => _showMoreOptions(filteredReplays[index]),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          setState(() => _searchQuery = value);
        },
        decoration: InputDecoration(
          hintText: 'Rechercher un replay...',
          hintStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.textTertiary,
          ),
          prefixIcon: Icon(Icons.search, color: AppColors.iconSecondary),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: AppColors.iconSecondary),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.md,
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSummary() {
    final totalDuration = _replays.fold<Duration>(
      Duration.zero,
      (sum, replay) => sum + replay.duration,
    );
    final totalViews = _replays.fold<int>(0, (sum, replay) => sum + replay.views);

    return Container(
      margin: AppSpacing.screenPaddingHorizontalOnly,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.brandPrimary.withValues(alpha: 0.1),
            AppColors.brandSecondary.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.brandPrimary.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(
            icon: Icons.play_circle_outline,
            value: '${_replays.length}',
            label: 'Replays',
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.borderDefault,
          ),
          _StatItem(
            icon: Icons.timer_outlined,
            value: _formatTotalDuration(totalDuration),
            label: 'Total',
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.borderDefault,
          ),
          _StatItem(
            icon: Icons.visibility_outlined,
            value: '$totalViews',
            label: 'Vues',
          ),
        ],
      ),
    );
  }

  Widget _buildNoResultsState() {
    final isSearching = _searchQuery.isNotEmpty;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSearching ? Icons.search_off : Icons.filter_list_off,
            size: 48,
            color: AppColors.iconTertiary,
          ),
          AppSpacing.vGapMd,
          Text(
            isSearching 
                ? 'Aucun résultat pour "$_searchQuery"'
                : 'Aucun replay trouvé',
            style: AppTypography.titleMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          AppSpacing.vGapXs,
          Text(
            isSearching
                ? 'Essayez avec d\'autres mots-clés'
                : 'Essayez un autre filtre',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          if (isSearching) ...[
            AppSpacing.vGapLg,
            TextButton.icon(
              onPressed: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
              },
              icon: Icon(Icons.clear, size: 18),
              label: Text('Effacer la recherche'),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTotalDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h${minutes.toString().padLeft(2, '0')}';
    }
    return '${minutes}min';
  }

  void _showReplayDetails(Replay replay) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _ReplayDetailsSheet(
          replay: replay,
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _toggleFavorite(Replay replay) {
    setState(() {
      replay.isFavorite = !replay.isFavorite;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          replay.isFavorite 
              ? 'Ajouté aux favoris' 
              : 'Retiré des favoris',
        ),
        backgroundColor: replay.isFavorite ? AppColors.success : AppColors.warning,
      ),
    );
  }

  void _shareReplay(Replay replay) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Partager le replay',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapMd,
            Text(
              replay.title,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            AppSpacing.vGapXl,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _ShareOption(
                  icon: Icons.link,
                  label: 'Copier le lien',
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Lien copié !'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                ),
                _ShareOption(
                  icon: Icons.share,
                  label: 'Partager',
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => replay.isShared = true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Replay partagé !'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                ),
                _ShareOption(
                  icon: Icons.download,
                  label: 'Télécharger',
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Téléchargement en cours...'),
                        backgroundColor: AppColors.brandPrimary,
                      ),
                    );
                  },
                ),
              ],
            ),
            AppSpacing.vGapXl,
          ],
        ),
      ),
    );
  }

  void _showMoreOptions(Replay replay) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.edit, color: AppColors.iconPrimary),
              title: Text('Renommer'),
              onTap: () {
                Navigator.pop(context);
                _showRenameDialog(replay);
              },
            ),
            ListTile(
              leading: Icon(Icons.people, color: AppColors.iconPrimary),
              title: Text('Identifier les joueurs'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Fonctionnalité bientôt disponible'),
                    backgroundColor: AppColors.brandPrimary,
                  ),
                );
              },
            ),
            ListTile(
              leading: Icon(Icons.content_cut, color: AppColors.iconPrimary),
              title: Text('Créer un clip'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Éditeur de clips bientôt disponible'),
                    backgroundColor: AppColors.brandPrimary,
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: Icon(Icons.delete_outline, color: AppColors.error),
              title: Text('Supprimer', style: TextStyle(color: AppColors.error)),
              onTap: () {
                Navigator.pop(context);
                _showDeleteConfirmation(replay);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showRenameDialog(Replay replay) {
    final controller = TextEditingController(text: replay.title);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Renommer le replay'),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: 'Nouveau nom',
            border: OutlineInputBorder(borderRadius: AppRadius.borderRadiusMd),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              setState(() => replay.title = controller.text);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Replay renommé'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(Replay replay) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Supprimer le replay ?'),
        content: Text('Cette action est irréversible. Le replay sera définitivement supprimé.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              setState(() => _replays.remove(replay));
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Replay supprimé'),
                  backgroundColor: AppColors.error,
                ),
              );
            },
            child: Text('Supprimer', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}

// Data Models
class Replay {
  String id;
  String title;
  final DateTime date;
  final Duration duration;
  final String court;
  final String thumbnailUrl;
  final List<String> players;
  final String score;
  final int views;
  bool isFavorite;
  bool isShared;

  Replay({
    required this.id,
    required this.title,
    required this.date,
    required this.duration,
    required this.court,
    required this.thumbnailUrl,
    required this.players,
    required this.score,
    required this.views,
    required this.isFavorite,
    required this.isShared,
  });
}

// Widgets
class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.brandPrimary, size: 24),
        AppSpacing.vGapXs,
        Text(
          value,
          style: AppTypography.titleMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.brandPrimary,
          ),
        ),
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _ReplayCard extends StatelessWidget {
  const _ReplayCard({
    required this.replay,
    required this.onTap,
    required this.onFavorite,
    required this.onShare,
    required this.onMore,
  });

  final Replay replay;
  final VoidCallback onTap;
  final VoidCallback onFavorite;
  final VoidCallback onShare;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
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
              // Thumbnail with play button overlay
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppRadius.card),
                    ),
                    child: Image.network(
                      replay.thumbnailUrl,
                      height: 160,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 160,
                        color: AppColors.surfaceSubtle,
                        child: Icon(
                          Icons.videocam,
                          size: 48,
                          color: AppColors.iconTertiary,
                        ),
                      ),
                    ),
                  ),
                  // Play button overlay
                  Positioned.fill(
                    child: Center(
                      child: Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimary.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.brandPrimary.withValues(alpha: 0.3),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.play_arrow,
                          color: AppColors.white,
                          size: 32,
                        ),
                      ),
                    ),
                  ),
                  // Duration badge
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.7),
                        borderRadius: AppRadius.borderRadiusSm,
                      ),
                      child: Text(
                        _formatDuration(replay.duration),
                        style: AppTypography.caption.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  // Favorite badge
                  if (replay.isFavorite)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.favorite,
                          color: AppColors.error,
                          size: 16,
                        ),
                      ),
                    ),
                  // Shared badge
                  if (replay.isShared)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.success,
                          borderRadius: AppRadius.borderRadiusSm,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.share, color: AppColors.white, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              'Partagé',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.white,
                                fontWeight: FontWeight.w500,
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
                    // Title and more button
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            replay.title,
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.more_vert, color: AppColors.iconSecondary),
                          onPressed: onMore,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    
                    AppSpacing.vGapXs,
                    
                    // Date and court
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 14,
                          color: AppColors.iconTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(replay.date),
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: AppColors.iconTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          replay.court,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    
                    AppSpacing.vGapSm,
                    
                    // Players
                    Row(
                      children: [
                        Icon(
                          Icons.people_outline,
                          size: 14,
                          color: AppColors.iconTertiary,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            replay.players.join(' • '),
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    
                    AppSpacing.vGapMd,
                    
                    // Score and actions
                    Row(
                      children: [
                        // Score badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary.withValues(alpha: 0.1),
                            borderRadius: AppRadius.borderRadiusSm,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.emoji_events,
                                size: 14,
                                color: AppColors.brandPrimary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                replay.score,
                                style: AppTypography.labelSmall.copyWith(
                                  color: AppColors.brandPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Views
                        const SizedBox(width: 12),
                        Icon(
                          Icons.visibility_outlined,
                          size: 14,
                          color: AppColors.iconTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${replay.views}',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        
                        const Spacer(),
                        
                        // Action buttons
                        IconButton(
                          icon: Icon(
                            replay.isFavorite ? Icons.favorite : Icons.favorite_border,
                            color: replay.isFavorite ? AppColors.error : AppColors.iconSecondary,
                            size: 20,
                          ),
                          onPressed: onFavorite,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: Icon(
                            Icons.share_outlined,
                            color: AppColors.iconSecondary,
                            size: 20,
                          ),
                          onPressed: onShare,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h${minutes.toString().padLeft(2, '0')}';
    }
    return '${minutes}min';
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}

class _ReplayDetailsSheet extends StatelessWidget {
  const _ReplayDetailsSheet({
    required this.replay,
    required this.scrollController,
  });

  final Replay replay;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      controller: scrollController,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderDefault,
                borderRadius: AppRadius.borderRadiusFull,
              ),
            ),
          ),
          
          // Video preview
          Stack(
            children: [
              Container(
                margin: const EdgeInsets.all(AppSpacing.lg),
                height: 220,
                decoration: BoxDecoration(
                  borderRadius: AppRadius.cardBorderRadius,
                  image: DecorationImage(
                    image: NetworkImage(replay.thumbnailUrl),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Positioned.fill(
                child: Container(
                  margin: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    borderRadius: AppRadius.cardBorderRadius,
                    color: Colors.black.withValues(alpha: 0.3),
                  ),
                  child: Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.brandPrimary.withValues(alpha: 0.4),
                            blurRadius: 20,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.play_arrow,
                        color: AppColors.white,
                        size: 40,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  replay.title,
                  style: AppTypography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                
                AppSpacing.vGapSm,
                
                // Score highlight
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Text(
                    'Score: ${replay.score}',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                
                AppSpacing.vGapLg,
                
                // Info cards
                Row(
                  children: [
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.calendar_today,
                        title: 'Date',
                        value: _formatDate(replay.date),
                      ),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.timer,
                        title: 'Durée',
                        value: _formatDuration(replay.duration),
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapMd,
                
                Row(
                  children: [
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.location_on,
                        title: 'Terrain',
                        value: replay.court,
                      ),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.visibility,
                        title: 'Vues',
                        value: '${replay.views}',
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapXl,
                
                // Players section
                Text(
                  'Joueurs',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                AppSpacing.vGapSm,
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: replay.players.map((player) => Chip(
                    avatar: CircleAvatar(
                      backgroundColor: AppColors.brandPrimary,
                      child: Text(
                        player[0],
                        style: TextStyle(
                          color: AppColors.white,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    label: Text(player),
                    backgroundColor: AppColors.surfaceSubtle,
                  )).toList(),
                ),
                
                AppSpacing.vGapXl,
                
                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Regarder',
                        icon: Icons.play_arrow,
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Lecture du replay...'),
                              backgroundColor: AppColors.brandPrimary,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapMd,
                
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Partager',
                        icon: Icons.share,
                        variant: AppButtonVariant.outline,
                        onPressed: () {
                          Navigator.pop(context);
                        },
                      ),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: AppButton(
                        label: 'Télécharger',
                        icon: Icons.download,
                        variant: AppButtonVariant.outline,
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Téléchargement en cours...'),
                              backgroundColor: AppColors.brandPrimary,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapXxl,
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h${minutes.toString().padLeft(2, '0')}';
    }
    return '${minutes}min';
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
  });

  final IconData icon;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.brandPrimary.withValues(alpha: 0.1),
              borderRadius: AppRadius.borderRadiusSm,
            ),
            child: Icon(icon, color: AppColors.brandPrimary, size: 20),
          ),
          AppSpacing.hGapSm,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
                Text(
                  value,
                  style: AppTypography.labelMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ShareOption extends StatelessWidget {
  const _ShareOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.brandPrimary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.brandPrimary),
          ),
          AppSpacing.vGapXs,
          Text(
            label,
            style: AppTypography.caption,
          ),
        ],
      ),
    );
  }
}

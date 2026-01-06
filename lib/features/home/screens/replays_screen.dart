import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class ReplaysScreen extends StatefulWidget {
  const ReplaysScreen({super.key});

  @override
  State<ReplaysScreen> createState() => _ReplaysScreenState();
}

class _ReplaysScreenState extends State<ReplaysScreen> with SingleTickerProviderStateMixin {
  int _selectedFilterIndex = 0;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final List<String> _filters = ['Tous', 'Ce mois', 'Favoris', 'Partagés'];
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _filters.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _selectedFilterIndex = _tabController.index);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  // Sample replays data
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
    
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      results = results.where((r) =>
        r.title.toLowerCase().contains(query) ||
        r.court.toLowerCase().contains(query) ||
        r.players.any((p) => p.toLowerCase().contains(query)) ||
        r.score.toLowerCase().contains(query)
      ).toList();
    }
    
    switch (_filters[_selectedFilterIndex]) {
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
      backgroundColor: const Color(0xFFFAF8F5),
      body: _replays.isEmpty ? _buildEmptyState() : _buildContent(),
    );
  }

  Widget _buildContent() {
    final filteredReplays = _filteredReplays;
    
    return CustomScrollView(
      slivers: [
        // Premium Header with Search
        SliverToBoxAdapter(
          child: Container(
            color: const Color(0xFFFAF8F5),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row: Back button + Title
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(Icons.arrow_back_ios_new, 
                          color: AppColors.textPrimary, 
                          size: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Mes Replays',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Search Bar (Always Visible)
                _buildSearchBar(),
              ],
            ),
          ),
        ),
        
        // Tab Filters
        SliverPersistentHeader(
          pinned: true,
          delegate: _SliverTabBarDelegate(
            TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              labelColor: AppColors.textPrimary,
              unselectedLabelColor: AppColors.textTertiary,
              labelStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.1,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.1,
              ),
              indicatorSize: TabBarIndicatorSize.label,
              indicator: UnderlineTabIndicator(
                borderSide: BorderSide(
                  width: 2.5,
                  color: AppColors.brandPrimary,
                ),
                borderRadius: BorderRadius.circular(2),
              ),
              dividerColor: Colors.transparent,
              tabs: _filters.map((f) => Tab(text: f)).toList(),
            ),
            backgroundColor: const Color(0xFFFAF8F5),
          ),
        ),
        
        // Content
        filteredReplays.isEmpty
          ? SliverFillRemaining(child: _buildNoResultsState())
          : SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _PremiumReplayCard(
                    replay: filteredReplays[index],
                    onTap: () => _showReplayDetails(filteredReplays[index]),
                    onFavorite: () => _toggleFavorite(filteredReplays[index]),
                    onShare: () => _shareReplay(filteredReplays[index]),
                    onMore: () => _showMoreOptions(filteredReplays[index]),
                  ),
                  childCount: filteredReplays.length,
                ),
              ),
            ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Back button
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(Icons.arrow_back_ios_new, 
                    color: AppColors.textPrimary, 
                    size: 18,
                  ),
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            const Spacer(),
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.brown100,
                borderRadius: BorderRadius.circular(28),
              ),
              child: Icon(
                Icons.videocam_off_outlined,
                size: 44,
                color: AppColors.brandPrimary.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Aucun replay',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Vos vidéos de matchs apparaîtront ici\naprès votre première partie filmée.',
              style: TextStyle(
                fontSize: 15,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: 'Réserver un terrain',
                onPressed: () => Navigator.pop(context),
              ),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => setState(() => _searchQuery = value),
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        decoration: InputDecoration(
          hintText: 'Rechercher...',
          hintStyle: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w400,
            color: AppColors.textTertiary,
          ),
          prefixIcon: Icon(Icons.search, color: AppColors.textTertiary, size: 20),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.close, color: AppColors.textTertiary, size: 18),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildNoResultsState() {
    final isSearching = _searchQuery.isNotEmpty;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.brown100,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(
                isSearching ? Icons.search_off_rounded : Icons.filter_list_off_rounded,
                size: 28,
                color: AppColors.brandPrimary.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              isSearching ? 'Aucun résultat' : 'Aucun replay',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              isSearching
                  ? 'Essayez d\'autres mots-clés'
                  : 'Aucun replay dans cette catégorie',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            if (isSearching) ...[
              const SizedBox(height: 20),
              TextButton(
                onPressed: () {
                  _searchController.clear();
                  setState(() => _searchQuery = '');
                },
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.brandPrimary,
                ),
                child: const Text('Effacer la recherche'),
              ),
            ],
          ],
        ),
      ),
    );
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

// Premium Tab Bar Delegate
class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverTabBarDelegate(this.tabBar, {required this.backgroundColor});

  final TabBar tabBar;
  final Color backgroundColor;

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: backgroundColor,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) {
    return tabBar != oldDelegate.tabBar;
  }
}

// Premium Replay Card - Cinematic Design
class _PremiumReplayCard extends StatelessWidget {
  const _PremiumReplayCard({
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
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cinematic Thumbnail (16:9 aspect ratio)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Thumbnail Image
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(20),
                      ),
                      child: Image.network(
                        replay.thumbnailUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.neutral200,
                          child: Icon(
                            Icons.videocam_rounded,
                            size: 48,
                            color: AppColors.neutral400,
                          ),
                        ),
                      ),
                    ),
                    // Subtle gradient overlay
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(20),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.4),
                            ],
                            stops: const [0.5, 1.0],
                          ),
                        ),
                      ),
                    ),
                    // Premium Play Button (centered, frosted glass effect)
                    Center(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(28),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.25),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withOpacity(0.4),
                                width: 1.5,
                              ),
                            ),
                            child: const Icon(
                              Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                        ),
                      ),
                    ),
                    // Duration Badge (bottom right, refined)
                    Positioned(
                      bottom: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _formatDuration(replay.duration),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ),
                    // Favorite indicator (top left, subtle)
                    if (replay.isFavorite)
                      Positioned(
                        top: 12,
                        left: 12,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.favorite_rounded,
                            color: AppColors.error,
                            size: 16,
                          ),
                        ),
                      ),
                    // Shared badge (top right, elegant)
                    if (replay.isShared)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.link_rounded,
                                color: Colors.white,
                                size: 12,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'Partagé',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              
              // Content Section (Clean & Minimal)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title Row with Actions
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                replay.title,
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              // Meta info (date, court, score) - single line
                              Text(
                                '${_formatDate(replay.date)} · ${replay.court} · ${replay.score}',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 0.1,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        // More options button
                        GestureDetector(
                          onTap: onMore,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            child: Icon(
                              Icons.more_horiz_rounded,
                              color: AppColors.textTertiary,
                              size: 22,
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 14),
                    
                    // Bottom Row: Players + Actions
                    Row(
                      children: [
                        // Players avatars stack
                        SizedBox(
                          width: 68,
                          height: 28,
                          child: Stack(
                            children: [
                              for (int i = 0; i < replay.players.length.clamp(0, 4); i++)
                                Positioned(
                                  left: i * 14.0,
                                  child: Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      color: _getAvatarColor(i),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 2,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        replay.players[i][0].toUpperCase(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(width: 8),
                        
                        // Views count
                        Icon(
                          Icons.visibility_outlined,
                          size: 14,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${replay.views}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textTertiary,
                          ),
                        ),
                        
                        const Spacer(),
                        
                        // Action buttons (refined)
                        _ActionButton(
                          icon: replay.isFavorite 
                              ? Icons.favorite_rounded 
                              : Icons.favorite_outline_rounded,
                          color: replay.isFavorite 
                              ? AppColors.error 
                              : AppColors.textTertiary,
                          onTap: onFavorite,
                        ),
                        const SizedBox(width: 4),
                        _ActionButton(
                          icon: Icons.ios_share_rounded,
                          color: AppColors.textTertiary,
                          onTap: onShare,
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

  Color _getAvatarColor(int index) {
    final colors = [
      AppColors.brandPrimary,
      AppColors.brandSecondary,
      AppColors.brown600,
      AppColors.gold600,
    ];
    return colors[index % colors.length];
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
    return '${date.day} ${months[date.month - 1]}';
  }
}

// Refined Action Button
class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          size: 20,
          color: color,
        ),
      ),
    );
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

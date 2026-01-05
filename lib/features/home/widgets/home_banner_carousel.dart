import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class HomeBannerCarousel extends StatefulWidget {
  const HomeBannerCarousel({super.key});

  @override
  State<HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<HomeBannerCarousel> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<BannerItem> _banners = [
    BannerItem(
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
      title: 'Réservez votre terrain',
    ),
    BannerItem(
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
      title: 'Tournoi ce weekend',
    ),
    BannerItem(
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
      title: 'Cours de padel',
    ),
    BannerItem(
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      title: 'Nouveaux équipements',
    ),
    BannerItem(
      imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80',
      title: 'Club PadelHouse',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 180,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemCount: _banners.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: _BannerCard(
                  banner: _banners[index],
                  onNext: () {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  },
                  onPrevious: () {
                    _pageController.previousPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  },
                  onTap: () {
                    _showBannerDetails(context, _banners[index]);
                  },
                ),
              );
            },
          ),
        ),
        AppSpacing.vGapMd,
        AppPageIndicator(
          count: _banners.length,
          currentIndex: _currentPage,
        ),
      ],
    );
  }

  void _showBannerDetails(BuildContext context, BannerItem banner) {
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
            ClipRRect(
              borderRadius: AppRadius.cardBorderRadius,
              child: Image.network(
                banner.imageUrl,
                height: 150,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            AppSpacing.vGapLg,
            Text(
              banner.title,
              style: AppTypography.headlineSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            AppSpacing.vGapMd,
            Text(
              _getBannerDescription(banner.title),
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            AppSpacing.vGapLg,
            AppButton(
              label: _getBannerAction(banner.title),
              isFullWidth: true,
              onPressed: () {
                Navigator.pop(context);
                _handleBannerAction(context, banner.title);
              },
            ),
            AppSpacing.vGapLg,
          ],
        ),
      ),
    );
  }

  String _getBannerDescription(String title) {
    switch (title) {
      case 'Réservez votre terrain':
        return 'Réservez facilement votre terrain de padel en quelques clics. Choisissez la date, l\'heure et le terrain de votre choix.';
      case 'Tournoi ce weekend':
        return 'Participez à notre tournoi amical ce weekend ! Inscriptions ouvertes pour tous les niveaux.';
      case 'Cours de padel':
        return 'Améliorez votre technique avec nos cours dispensés par des professionnels certifiés.';
      case 'Nouveaux équipements':
        return 'Découvrez nos derniers équipements : raquettes, balles et accessoires de qualité.';
      case 'Club PadelHouse':
        return 'Rejoignez le club PadelHouse et profitez d\'avantages exclusifs et de tarifs préférentiels.';
      default:
        return 'Découvrez cette offre exclusive chez PadelHouse.';
    }
  }

  String _getBannerAction(String title) {
    switch (title) {
      case 'Réservez votre terrain':
        return 'Réserver maintenant';
      case 'Tournoi ce weekend':
        return 'S\'inscrire au tournoi';
      case 'Cours de padel':
        return 'Voir les cours';
      case 'Nouveaux équipements':
        return 'Voir les équipements';
      case 'Club PadelHouse':
        return 'Rejoindre le club';
      default:
        return 'En savoir plus';
    }
  }

  void _handleBannerAction(BuildContext context, String title) {
    String message;
    switch (title) {
      case 'Réservez votre terrain':
        message = 'Redirection vers les réservations...';
        break;
      case 'Tournoi ce weekend':
        Navigator.pushNamed(context, '/tournaments');
        return;
      case 'Cours de padel':
        message = 'Les cours seront bientôt disponibles !';
        break;
      case 'Nouveaux équipements':
        message = 'Boutique bientôt disponible !';
        break;
      case 'Club PadelHouse':
        message = 'Inscription au club en cours...';
        break;
      default:
        message = 'Action en cours...';
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.brandPrimary,
      ),
    );
  }
}

class _BannerCard extends StatelessWidget {
  const _BannerCard({
    required this.banner,
    this.onNext,
    this.onPrevious,
    this.onTap,
  });

  final BannerItem banner;
  final VoidCallback? onNext;
  final VoidCallback? onPrevious;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardBorderRadius,
        boxShadow: AppShadows.imageShadow,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.cardBorderRadius,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Image
            InkWell(
              onTap: onTap,
              child: Image.network(
                banner.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.neutral200,
                    child: Center(
                      child: Icon(
                        AppIcons.image,
                        size: 48,
                        color: AppColors.neutral400,
                      ),
                    ),
                  );
                },
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    color: AppColors.neutral100,
                    child: Center(
                      child: CircularProgressIndicator(
                        value: loadingProgress.expectedTotalBytes != null
                            ? loadingProgress.cumulativeBytesLoaded /
                                loadingProgress.expectedTotalBytes!
                            : null,
                        color: AppColors.brandPrimary,
                        strokeWidth: 2,
                      ),
                    ),
                  );
                },
              ),
            ),

            // Navigation arrows
            Positioned(
              left: AppSpacing.sm,
              top: 0,
              bottom: 0,
              child: Center(
                child: _NavigationArrow(
                  icon: AppIcons.chevronLeft,
                  onTap: onPrevious,
                ),
              ),
            ),
            Positioned(
              right: AppSpacing.sm,
              top: 0,
              bottom: 0,
              child: Center(
                child: _NavigationArrow(
                  icon: AppIcons.chevronRight,
                  onTap: onNext,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavigationArrow extends StatelessWidget {
  const _NavigationArrow({
    required this.icon,
    this.onTap,
  });

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.white.withValues(alpha: 0.9),
      borderRadius: AppRadius.borderRadiusFull,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.borderRadiusFull,
        child: Container(
          padding: AppSpacing.paddingXs,
          child: Icon(
            icon,
            size: AppIcons.sizeMd,
            color: AppColors.iconPrimary,
          ),
        ),
      ),
    );
  }
}

class BannerItem {
  final String imageUrl;
  final String title;

  BannerItem({required this.imageUrl, required this.title});
}

import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import '../../auth/screens/email_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Réservez en quelques clics',
      description: 'Consultez les disponibilités en temps réel et réservez votre terrain de padel en moins de 30 secondes.',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
      icon: Icons.touch_app_outlined,
    ),
    OnboardingPage(
      title: 'Choisissez votre créneau',
      description: 'Des créneaux flexibles adaptés à votre emploi du temps. Matin, midi ou soirée, jouez quand vous voulez.',
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
      icon: Icons.schedule_outlined,
    ),
    OnboardingPage(
      title: 'Participez aux événements',
      description: 'Tournois, initiations, soirées afterwork... Rejoignez une communauté passionnée de padel.',
      imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80',
      icon: Icons.emoji_events_outlined,
    ),
    OnboardingPage(
      title: 'Suivez vos performances',
      description: 'Historique de réservations, statistiques et replays de vos matchs. Progressez à chaque session.',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
      icon: Icons.insights_outlined,
    ),
  ];

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: AppAnimations.pageTransitionDuration,
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToAuth();
    }
  }

  void _skip() {
    _navigateToAuth();
  }

  void _navigateToAuth() {
    // Use phase transition for this milestone navigation (onboarding → auth)
    context.navigatePhase(
      const EmailScreen(),
      routeName: '/auth/email',
      replace: true,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo
                  Image.asset(
                    'assets/images/logo.png',
                    height: 28,
                    errorBuilder: (_, __, ___) => const AppLogo(
                      size: AppLogoSize.small,
                    ),
                  ),
                  // Skip
                  TextButton(
                    onPressed: _skip,
                    child: Text(
                      'Passer',
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Page content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _OnboardingPageView(page: _pages[index]);
                },
              ),
            ),

            // Bottom section
            Padding(
              padding: AppSpacing.screenPadding,
              child: Column(
                children: [
                  // Page indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _pages.length,
                      (index) => _PageDot(isActive: index == _currentPage),
                    ),
                  ),
                  
                  AppSpacing.vGapXl,

                  // Action button
                  AppButton(
                    label: _currentPage == _pages.length - 1
                        ? 'Commencer'
                        : 'Suivant',
                    onPressed: _nextPage,
                    variant: AppButtonVariant.primary,
                    size: AppButtonSize.large,
                    isFullWidth: true,
                    icon: _currentPage == _pages.length - 1
                        ? null
                        : AppIcons.arrowForward,
                    iconPosition: IconPosition.trailing,
                  ),

                  AppSpacing.vGapMd,
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPageView extends StatelessWidget {
  const _OnboardingPageView({required this.page});

  final OnboardingPage page;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacing.screenPaddingHorizontalOnly,
      child: Column(
        children: [
          AppSpacing.vGapLg,
          
          // Image
          Expanded(
            flex: 5,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              decoration: BoxDecoration(
                borderRadius: AppRadius.borderRadiusXxl,
                boxShadow: AppShadows.imageShadow,
              ),
              child: ClipRRect(
                borderRadius: AppRadius.borderRadiusXxl,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      page.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: AppColors.neutral200,
                        child: Icon(
                          page.icon,
                          size: 80,
                          color: AppColors.brandPrimary,
                        ),
                      ),
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
                    
                    // Gradient overlay at bottom
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 100,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              AppColors.black.withValues(alpha: 0.3),
                            ],
                          ),
                        ),
                      ),
                    ),
                    
                    // Icon badge
                    Positioned(
                      bottom: AppSpacing.lg,
                      right: AppSpacing.lg,
                      child: Container(
                        padding: AppSpacing.paddingMd,
                        decoration: BoxDecoration(
                          color: AppColors.brandSecondary,
                          borderRadius: AppRadius.borderRadiusFull,
                          boxShadow: AppShadows.shadowMd,
                        ),
                        child: Icon(
                          page.icon,
                          color: AppColors.white,
                          size: 28,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          AppSpacing.vGapXl,

          // Title
          Expanded(
            flex: 2,
            child: Column(
              children: [
                Text(
                  page.title,
                  style: AppTypography.headlineSmall.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                AppSpacing.vGapMd,
                
                // Description
                Text(
                  page.description,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PageDot extends StatelessWidget {
  const _PageDot({required this.isActive});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: AppAnimations.durationNormal,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: isActive ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.brandPrimary : AppColors.neutral300,
        borderRadius: AppRadius.borderRadiusFull,
      ),
    );
  }
}

class OnboardingPage {
  final String title;
  final String description;
  final String imageUrl;
  final IconData icon;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.icon,
  });
}

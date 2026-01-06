import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import '../../../../app/app_router.dart';
import '../../../core/design_system/design_system.dart';

class HomeActionCards extends StatelessWidget {
  const HomeActionCards({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const AppSectionHeader(title: "Let's Padel"),
        const Gap(16),
        SizedBox(
          height: 280, // Fixed height for the bento grid
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // LARGE CARD (Left)
              Expanded(
                flex: 5,
                child: _BentoCard(
                  title: 'Réserver\nun terrain',
                  subtitle: 'Jouez maintenant',
                  icon: AppIcons.sportsTennis,
                  imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
                  color: AppColors.brandPrimary,
                  isLarge: true,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            Icon(AppIcons.calendar, color: AppColors.white),
                            const Gap(8),
                            const Expanded(child: Text('Rendez-vous dans l\'onglet "Réservations"')),
                          ],
                        ),
                        backgroundColor: AppColors.brandSecondary,
                        duration: const Duration(seconds: 3),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              ),
              const Gap(12),
              // RIGHT COLUMN
              Expanded(
                flex: 4,
                child: Column(
                  children: [
                    // TOP RIGHT CARD
                    Expanded(
                      child: _BentoCard(
                        title: 'Replays',
                        icon: AppIcons.playCircle,
                        imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&q=80',
                        color: AppColors.brandSecondary,
                        onTap: () => Navigator.pushNamed(context, AppRouter.replays),
                      ),
                    ),
                    const Gap(12),
                    // BOTTOM RIGHT CARD (New)
                    Expanded(
                      child: _BentoCard(
                        title: 'Coaching',
                        icon: AppIcons.coaching,
                        imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
                        color: AppColors.brandPrimary,
                        onTap: () => Navigator.pushNamed(context, AppRouter.coaching),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ]
      .animate(interval: 50.ms)
      .fadeIn(duration: 400.ms)
      .slideY(begin: 0.1, end: 0, curve: Curves.easeOutQuad),
    );
  }
}

class _BentoCard extends StatelessWidget {
  const _BentoCard({
    required this.title,
    this.subtitle,
    required this.icon,
    required this.imageUrl,
    required this.color,
    this.isLarge = false,
    this.onTap,
  });

  final String title;
  final String? subtitle;
  final IconData icon;
  final String imageUrl;
  final Color color;
  final bool isLarge;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Material(
          color: AppColors.surfaceDefault,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Background Image using NetworkImage
                Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: AppColors.neutral300),
                ),

                // 2. Gradient Overlay (Glass/Dark)
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        AppColors.black.withValues(alpha: 0.3),
                        AppColors.black.withValues(alpha: 0.8),
                      ],
                      stops: const [0.0, 0.4, 1.0],
                    ),
                  ),
                ),

                // 3. Neon Glow Effect (subtle)
                if (isLarge)
                  Positioned(
                    top: -20,
                    right: -20,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.neonGlow,
                            blurRadius: 50,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                    ),
                  ),

                // 4. Content
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Icon (no wrapper)
                      Icon(
                        icon,
                        color: AppColors.white,
                        size: isLarge ? 32 : 26,
                      ),
                      const Gap(12),
                      
                      // Text Content
                      Text(
                        title,
                        style: isLarge 
                          ? AppTypography.headlineSmall.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.w700,
                              height: 1.1,
                            )
                          : AppTypography.titleMedium.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      
                      if (subtitle != null && isLarge) ...[
                        const Gap(4),
                        Text(
                          subtitle!,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.neutral200,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

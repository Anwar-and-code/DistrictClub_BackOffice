import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class HomeActionCards extends StatelessWidget {
  const HomeActionCards({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const AppSectionHeader(title: "Let's Padel"),
        AppSpacing.vGapMd,
        Row(
          children: [
            Expanded(
              child: _ActionCard(
                title: 'Réserver un terrain',
                icon: AppIcons.sportsTennis,
                imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
                onTap: () {
                  // Navigate to reservation
                },
              ),
            ),
            AppSpacing.hGapMd,
            Expanded(
              child: _ActionCard(
                title: 'Voir les replays',
                icon: AppIcons.playCircle,
                imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&q=80',
                onTap: () {
                  // Navigate to replays
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.title,
    required this.icon,
    required this.imageUrl,
    this.onTap,
  });

  final String title;
  final IconData icon;
  final String imageUrl;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardBorderRadius,
        boxShadow: AppShadows.cardShadow,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.cardBorderRadius,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Background image
                Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.neutral300,
                      child: Center(
                        child: Icon(
                          icon,
                          size: 40,
                          color: AppColors.neutral500,
                        ),
                      ),
                    );
                  },
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: AppColors.neutral100,
                      child: const Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                        ),
                      ),
                    );
                  },
                ),

                // Dark gradient overlay
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        AppColors.black.withValues(alpha: 0.6),
                      ],
                    ),
                  ),
                ),

                // Content
                Positioned(
                  left: AppSpacing.md,
                  bottom: AppSpacing.md,
                  right: AppSpacing.md,
                  child: Row(
                    children: [
                      Container(
                        padding: AppSpacing.paddingXs,
                        decoration: BoxDecoration(
                          color: AppColors.white.withValues(alpha: 0.2),
                          borderRadius: AppRadius.borderRadiusSm,
                        ),
                        child: Icon(
                          icon,
                          color: AppColors.white,
                          size: AppIcons.sizeMd,
                        ),
                      ),
                      AppSpacing.hGapSm,
                      Expanded(
                        child: Text(
                          title,
                          style: AppTypography.labelMedium.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
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

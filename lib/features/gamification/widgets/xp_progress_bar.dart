import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/design_system/design_system.dart';
import '../services/gamification_service_v2.dart';

class XpProgressBar extends StatelessWidget {
  final bool showLevel;
  final bool compact;

  const XpProgressBar({
    super.key,
    this.showLevel = true,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GamificationServiceV2.instance,
      builder: (context, _) {
        final service = GamificationServiceV2.instance;
        
        if (compact) {
          return _buildCompact(service);
        }
        
        return _buildFull(service);
      },
    );
  }

  Widget _buildCompact(GamificationServiceV2 service) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceDefault,
        borderRadius: AppRadius.borderRadiusFull,
        border: Border.all(color: AppColors.borderDefault),
        boxShadow: AppShadows.shadowSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Level Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: AppRadius.borderRadiusFull,
            ),
            child: Text(
              'Nv.${service.level}',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Mini progress bar
          SizedBox(
            width: 50,
            child: ClipRRect(
              borderRadius: AppRadius.borderRadiusFull,
              child: LinearProgressIndicator(
                value: service.currentLevelProgress,
                backgroundColor: AppColors.neutral200,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandSecondary),
                minHeight: 6,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '${service.xp} XP',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFull(GamificationServiceV2 service) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceDefault,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
        boxShadow: AppShadows.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Level and XP
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Level Badge
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.brandPrimary.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        '${service.level}',
                        style: AppTypography.titleLarge.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Niveau ${service.level}',
                        style: AppTypography.titleMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _getLevelTitle(service.level),
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.brandSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              // Total XP
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.star_rounded,
                        color: AppColors.brandSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${service.xp}',
                        style: AppTypography.titleMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'XP Total',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          
          AppSpacing.vGapLg,
          
          // Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Progression',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    '${service.xpToNextLevel} XP restants',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Stack(
                children: [
                  // Background
                  Container(
                    height: 10,
                    decoration: BoxDecoration(
                      color: AppColors.neutral200,
                      borderRadius: AppRadius.borderRadiusFull,
                    ),
                  ),
                  // Progress
                  FractionallySizedBox(
                    widthFactor: service.currentLevelProgress.clamp(0.0, 1.0),
                    child: Container(
                      height: 10,
                      decoration: BoxDecoration(
                        gradient: AppColors.goldGradient,
                        borderRadius: AppRadius.borderRadiusFull,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.brandSecondary.withValues(alpha: 0.4),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                  ).animate(onPlay: (c) => c.repeat())
                    .shimmer(duration: 2000.ms, color: AppColors.white.withValues(alpha: 0.3)),
                ],
              ),
            ],
          ),
          
          // Streak indicator if active
          if (service.currentStreak > 0) ...[
            AppSpacing.vGapMd,
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.brandSecondary.withValues(alpha: 0.1),
                borderRadius: AppRadius.borderRadiusSm,
                border: Border.all(color: AppColors.brandSecondary.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.local_fire_department_rounded,
                    color: AppColors.brandSecondary,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${service.currentStreak} jours de suite !',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.brandSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _getLevelTitle(int level) {
    if (level >= 20) return '🏆 Légende du Padel';
    if (level >= 15) return '⭐ Expert';
    if (level >= 10) return '🎯 Champion';
    if (level >= 7) return '🔥 Confirmé';
    if (level >= 4) return '🎾 Régulier';
    if (level >= 2) return '👋 Débutant';
    return '🌱 Nouveau';
  }
}

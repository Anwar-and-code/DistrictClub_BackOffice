import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/design_system/design_system.dart';
import '../services/gamification_service_v2.dart';

/// A minimal, attention-grabbing circular progress indicator for user level/XP
/// 
/// Inspired by Duolingo and Fitbit's gamification patterns:
/// - Circular progress ring showing XP progress to next level
/// - Level number prominently displayed in center
/// - Subtle glow and shimmer animations to draw attention
/// - Tappable to show more details
class UserProgressRing extends StatelessWidget {
  const UserProgressRing({
    super.key,
    this.size = 48,
    this.onTap,
    this.showStreak = true,
  });

  final double size;
  final VoidCallback? onTap;
  final bool showStreak;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GamificationServiceV2.instance,
      builder: (context, _) {
        final service = GamificationServiceV2.instance;
        
        return GestureDetector(
          onTap: onTap ?? () => _showProgressDetails(context, service),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Streak indicator (fire icon)
              if (showStreak && service.currentStreak > 0) ...[
                _StreakBadge(streak: service.currentStreak),
                const SizedBox(width: 8),
              ],
              // Main circular progress
              _CircularProgress(
                size: size,
                level: service.level,
                progress: service.currentLevelProgress,
              ),
            ],
          ),
        );
      },
    );
  }

  void _showProgressDetails(BuildContext context, GamificationServiceV2 service) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => _ProgressDetailsSheet(service: service),
    );
  }
}

class _StreakBadge extends StatelessWidget {
  const _StreakBadge({required this.streak});

  final int streak;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.brandSecondary.withValues(alpha: 0.15),
            AppColors.brandSecondary.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: AppRadius.borderRadiusFull,
        border: Border.all(
          color: AppColors.brandSecondary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.local_fire_department_rounded,
            size: 14,
            color: AppColors.brandSecondary,
          )
          .animate(onPlay: (c) => c.repeat(reverse: true))
          .scale(
            begin: const Offset(1, 1),
            end: const Offset(1.15, 1.15),
            duration: 800.ms,
            curve: Curves.easeInOut,
          ),
          const SizedBox(width: 2),
          Text(
            '$streak',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandSecondary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _CircularProgress extends StatelessWidget {
  const _CircularProgress({
    required this.size,
    required this.level,
    required this.progress,
  });

  final double size;
  final int level;
  final double progress;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Glow effect
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.brandPrimary.withValues(alpha: 0.2),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          // Progress ring
          CustomPaint(
            size: Size(size, size),
            painter: _ProgressRingPainter(
              progress: progress,
              strokeWidth: 3.5,
              backgroundColor: AppColors.neutral200,
              progressColor: AppColors.brandSecondary,
            ),
          ),
          // Level badge center
          Container(
            width: size - 10,
            height: size - 10,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.brandPrimary.withValues(alpha: 0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Center(
              child: Text(
                '$level',
                style: AppTypography.titleSmall.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                  height: 1,
                ),
              ),
            ),
          ),
          // Shimmer overlay for attention
          SizedBox(
            width: size,
            height: size,
            child: const DecoratedBox(
              decoration: BoxDecoration(shape: BoxShape.circle),
            ),
          )
          .animate(onPlay: (c) => c.repeat())
          .shimmer(
            duration: 3000.ms,
            delay: 2000.ms,
            color: AppColors.white.withValues(alpha: 0.3),
          ),
        ],
      ),
    );
  }
}

class _ProgressRingPainter extends CustomPainter {
  _ProgressRingPainter({
    required this.progress,
    required this.strokeWidth,
    required this.backgroundColor,
    required this.progressColor,
  });

  final double progress;
  final double strokeWidth;
  final Color backgroundColor;
  final Color progressColor;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Background circle
    final backgroundPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, backgroundPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = progressColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * math.pi * progress.clamp(0.0, 1.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2, // Start from top
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(_ProgressRingPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _ProgressDetailsSheet extends StatelessWidget {
  const _ProgressDetailsSheet({required this.service});

  final GamificationServiceV2 service;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.backgroundPrimary,
        borderRadius: AppRadius.borderRadiusXxl,
        boxShadow: AppShadows.shadowXl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
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
          
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              children: [
                // Large level display
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.brandPrimary.withValues(alpha: 0.4),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      '${service.level}',
                      style: AppTypography.headlineLarge.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )
                .animate()
                .scale(begin: const Offset(0.8, 0.8), curve: Curves.elasticOut, duration: 600.ms),
                
                AppSpacing.vGapMd,
                
                // Level title
                Text(
                  'Niveau ${service.level}',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  _getLevelTitle(service.level),
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.brandSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                
                AppSpacing.vGapLg,
                
                // Progress bar
                Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${service.xp} XP',
                          style: AppTypography.labelMedium.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${service.xpToNextLevel} XP pour niveau ${service.level + 1}',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: AppRadius.borderRadiusFull,
                      child: LinearProgressIndicator(
                        value: service.currentLevelProgress,
                        backgroundColor: AppColors.neutral200,
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandSecondary),
                        minHeight: 8,
                      ),
                    )
                    .animate()
                    .shimmer(delay: 500.ms, duration: 1500.ms, color: AppColors.white.withValues(alpha: 0.3)),
                  ],
                ),
                
                AppSpacing.vGapLg,
                
                // Stats row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _StatItem(
                      icon: Icons.star_rounded,
                      value: '${service.xp}',
                      label: 'XP Total',
                      color: AppColors.brandSecondary,
                    ),
                    _StatItem(
                      icon: Icons.local_fire_department_rounded,
                      value: '${service.currentStreak}',
                      label: 'Jours',
                      color: Colors.orange,
                    ),
                    _StatItem(
                      icon: Icons.sports_tennis_rounded,
                      value: '${service.reservationsCount}',
                      label: 'Réservations',
                      color: AppColors.brandPrimary,
                    ),
                  ],
                ),
                
                AppSpacing.vGapLg,
                
                // CTA Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.brandPrimary,
                      foregroundColor: AppColors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: AppRadius.borderRadiusMd,
                      ),
                    ),
                    child: const Text('Continuer à jouer'),
                  ),
                ),
              ],
            ),
          ),
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

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: AppTypography.titleMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }
}

import 'dart:async';
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';
import '../../../core/design_system/design_system.dart';
import '../models/achievement.dart';
import '../models/gamification_event.dart';
import '../services/gamification_service_v2.dart';

class CelebrationOverlay extends StatefulWidget {
  final Widget child;

  const CelebrationOverlay({super.key, required this.child});

  @override
  State<CelebrationOverlay> createState() => _CelebrationOverlayState();
}

class _CelebrationOverlayState extends State<CelebrationOverlay> {
  late ConfettiController _confettiController;
  StreamSubscription<GamificationEvent>? _eventSubscription;
  
  GamificationEvent? _currentEvent;
  bool _showOverlay = false;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
    _eventSubscription = GamificationServiceV2.instance.events.listen(_handleEvent);
  }

  void _handleEvent(GamificationEvent event) {
    switch (event.type) {
      case GamificationEventType.xpEarned:
        _showXpToast(event);
        break;
      case GamificationEventType.levelUp:
        _showLevelUpCelebration(event);
        break;
      case GamificationEventType.achievementUnlocked:
        _showAchievementCelebration(event);
        break;
      case GamificationEventType.streakUpdated:
        break;
    }
  }

  void _showXpToast(GamificationEvent event) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: _XpToastContent(
          xpAmount: event.xpAmount ?? 0,
          message: event.message,
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
      ),
    );
  }

  void _showLevelUpCelebration(GamificationEvent event) {
    setState(() {
      _currentEvent = event;
      _showOverlay = true;
    });
    _confettiController.play();
    
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _showOverlay = false;
          _currentEvent = null;
        });
      }
    });
  }

  void _showAchievementCelebration(GamificationEvent event) {
    setState(() {
      _currentEvent = event;
      _showOverlay = true;
    });
    _confettiController.play();
    
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _showOverlay = false;
          _currentEvent = null;
        });
      }
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _eventSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        
        // Confetti from top center - using app brand colors
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: _confettiController,
            blastDirectionality: BlastDirectionality.explosive,
            shouldLoop: false,
            colors: const [
              AppColors.brandPrimary,
              AppColors.brandSecondary,
              AppColors.brandOlive,
              AppColors.gold400,
              AppColors.brown300,
              AppColors.gold200,
            ],
            numberOfParticles: 50,
            gravity: 0.1,
            emissionFrequency: 0.05,
            maxBlastForce: 20,
            minBlastForce: 8,
          ),
        ),
        
        // Celebration overlay
        if (_showOverlay && _currentEvent != null)
          GestureDetector(
            onTap: () {
              setState(() {
                _showOverlay = false;
                _currentEvent = null;
              });
            },
            child: _buildCelebrationCard(),
          ),
      ],
    );
  }

  Widget _buildCelebrationCard() {
    final event = _currentEvent!;
    
    if (event.type == GamificationEventType.levelUp) {
      return _LevelUpCard(level: event.newLevel ?? 1);
    }
    
    if (event.type == GamificationEventType.achievementUnlocked && event.achievement != null) {
      return _AchievementCard(achievement: event.achievement!);
    }
    
    return const SizedBox.shrink();
  }
}

class _XpToastContent extends StatelessWidget {
  final int xpAmount;
  final String? message;

  const _XpToastContent({required this.xpAmount, this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: AppRadius.borderRadiusFull,
        boxShadow: [
          BoxShadow(
            color: AppColors.brandPrimary.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.star_rounded,
              color: AppColors.white,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '+$xpAmount XP',
                style: AppTypography.titleMedium.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (message != null)
                Text(
                  message!,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.white.withValues(alpha: 0.8),
                  ),
                ),
            ],
          ),
        ],
      ),
    ).animate()
      .fadeIn(duration: 300.ms)
      .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1), duration: 300.ms, curve: Curves.elasticOut)
      .shimmer(delay: 500.ms, duration: 1000.ms, color: AppColors.white.withValues(alpha: 0.3));
  }
}

class _LevelUpCard extends StatelessWidget {
  final int level;

  const _LevelUpCard({required this.level});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.black.withValues(alpha: 0.6),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(AppSpacing.xl),
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.backgroundPrimary,
            borderRadius: AppRadius.borderRadiusXxl,
            border: Border.all(
              color: AppColors.brandSecondary,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.brandSecondary.withValues(alpha: 0.3),
                blurRadius: 24,
                spreadRadius: 4,
              ),
              ...AppShadows.shadowXl,
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Trophy Animation
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  gradient: AppColors.goldGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandSecondary.withValues(alpha: 0.4),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Lottie.network(
                  'https://assets2.lottiefiles.com/packages/lf20_touohxv0.json',
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Icon(
                    Icons.emoji_events_rounded,
                    size: 60,
                    color: AppColors.white,
                  ),
                ),
              ).animate()
                .scale(begin: const Offset(0, 0), duration: 600.ms, curve: Curves.elasticOut),
              
              AppSpacing.vGapLg,
              
              // Level Up Text
              Text(
                'NIVEAU SUPÉRIEUR !',
                style: AppTypography.titleLarge.copyWith(
                  color: AppColors.brandSecondary,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ).animate(delay: 300.ms)
                .fadeIn()
                .scale(begin: const Offset(0.5, 0.5), curve: Curves.elasticOut),
              
              AppSpacing.vGapMd,
              
              // Level Number
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: AppRadius.borderRadiusLg,
                  boxShadow: AppShadows.buttonShadow,
                ),
                child: Text(
                  'NIVEAU $level',
                  style: AppTypography.headlineMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ).animate(delay: 500.ms)
                .fadeIn()
                .scale(begin: const Offset(0, 0), curve: Curves.elasticOut),
              
              AppSpacing.vGapLg,
              
              Text(
                'Continuez comme ça ! 🎉',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ).animate(delay: 800.ms).fadeIn(),
              
              AppSpacing.vGapLg,
              
              Text(
                'Touchez pour continuer',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textTertiary,
                ),
              ).animate(delay: 1000.ms, onPlay: (c) => c.repeat(reverse: true))
                .fadeIn()
                .then()
                .fadeOut(duration: 1000.ms),
            ],
          ),
        ).animate()
          .fadeIn(duration: 400.ms)
          .scale(begin: const Offset(0.9, 0.9), curve: Curves.easeOutBack),
      ),
    );
  }
}

class _AchievementCard extends StatelessWidget {
  final Achievement achievement;

  const _AchievementCard({required this.achievement});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.black.withValues(alpha: 0.6),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(AppSpacing.xl),
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.backgroundPrimary,
            borderRadius: AppRadius.borderRadiusXxl,
            border: Border.all(
              color: AppColors.brandPrimary,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.brandPrimary.withValues(alpha: 0.2),
                blurRadius: 24,
                spreadRadius: 4,
              ),
              ...AppShadows.shadowXl,
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Achievement Badge
              Container(
                width: 100,
                height: 100,
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
                child: Icon(
                  achievement.icon,
                  size: 48,
                  color: AppColors.white,
                ),
              ).animate()
                .scale(begin: const Offset(0, 0), duration: 600.ms, curve: Curves.elasticOut)
                .then()
                .shimmer(duration: 1500.ms, color: AppColors.white.withValues(alpha: 0.3)),
              
              AppSpacing.vGapLg,
              
              // Unlocked Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.brandOlive.withValues(alpha: 0.1),
                  borderRadius: AppRadius.borderRadiusFull,
                  border: Border.all(color: AppColors.brandOlive.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.lock_open_rounded,
                      color: AppColors.brandOlive,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'SUCCÈS DÉBLOQUÉ',
                      style: AppTypography.overline.copyWith(
                        color: AppColors.brandOlive,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 300.ms).fadeIn().slideY(begin: -0.5),
              
              AppSpacing.vGapMd,
              
              // Achievement Title
              Text(
                achievement.title,
                style: AppTypography.headlineSmall.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ).animate(delay: 500.ms).fadeIn().scale(),
              
              AppSpacing.vGapXs,
              
              // Achievement Description
              Text(
                achievement.description,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ).animate(delay: 600.ms).fadeIn(),
              
              AppSpacing.vGapLg,
              
              // XP Reward
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  gradient: AppColors.goldGradient,
                  borderRadius: AppRadius.borderRadiusFull,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandSecondary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star_rounded, color: AppColors.white, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      '+${achievement.xpReward} XP',
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 800.ms)
                .fadeIn()
                .scale(begin: const Offset(0.5, 0.5), curve: Curves.elasticOut),
              
              AppSpacing.vGapLg,
              
              Text(
                'Touchez pour continuer',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textTertiary,
                ),
              ).animate(delay: 1200.ms, onPlay: (c) => c.repeat(reverse: true))
                .fadeIn()
                .then()
                .fadeOut(duration: 1000.ms),
            ],
          ),
        ).animate()
          .fadeIn(duration: 400.ms)
          .scale(begin: const Offset(0.9, 0.9), curve: Curves.easeOutBack),
      ),
    );
  }
}

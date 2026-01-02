import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';

/// Card style variants
enum AppCardVariant { elevated, outlined, filled }

/// PadelHouse Design System - Card Component
/// 
/// A versatile card component for displaying content.
/// 
/// Usage:
/// ```dart
/// AppCard(
///   child: Text('Content'),
///   variant: AppCardVariant.elevated,
///   onTap: () {},
/// )
/// ```
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.variant = AppCardVariant.elevated,
    this.onTap,
    this.padding,
    this.margin,
    this.width,
    this.height,
    this.borderRadius,
    this.backgroundColor,
  });

  final Widget child;
  final AppCardVariant variant;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final effectivePadding = padding ?? AppSpacing.cardPaddingAll;
    final effectiveBorderRadius = borderRadius ?? AppRadius.cardBorderRadius;

    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: _getDecoration(effectiveBorderRadius),
      child: Material(
        color: Colors.transparent,
        borderRadius: effectiveBorderRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: effectiveBorderRadius,
          splashColor: AppColors.brandPrimary.withOpacity(0.1),
          highlightColor: AppColors.brandPrimary.withOpacity(0.05),
          child: Padding(
            padding: effectivePadding,
            child: child,
          ),
        ),
      ),
    );
  }

  BoxDecoration _getDecoration(BorderRadius radius) {
    switch (variant) {
      case AppCardVariant.elevated:
        return BoxDecoration(
          color: backgroundColor ?? AppColors.cardBackground,
          borderRadius: radius,
          boxShadow: AppShadows.cardShadow,
        );
      case AppCardVariant.outlined:
        return BoxDecoration(
          color: backgroundColor ?? AppColors.cardBackground,
          borderRadius: radius,
          border: Border.all(color: AppColors.cardBorder),
        );
      case AppCardVariant.filled:
        return BoxDecoration(
          color: backgroundColor ?? AppColors.surfaceSubtle,
          borderRadius: radius,
        );
    }
  }
}

/// Action Card - Card with image overlay (from Home screen)
/// Used for "Réserver un terrain" and "Voir les replays" cards
class AppActionCard extends StatelessWidget {
  const AppActionCard({
    super.key,
    required this.title,
    required this.backgroundImage,
    this.icon,
    this.onTap,
    this.width,
    this.height = 120,
    this.overlayOpacity = 0.4,
  });

  final String title;
  final String backgroundImage;
  final IconData? icon;
  final VoidCallback? onTap;
  final double? width;
  final double height;
  final double overlayOpacity;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
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
                // Background image placeholder (can be replaced with actual image)
                Container(
                  color: AppColors.neutral300,
                  child: Center(
                    child: Icon(
                      Icons.image,
                      size: 40,
                      color: AppColors.neutral500,
                    ),
                  ),
                ),
                // Dark overlay
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        AppColors.black.withOpacity(overlayOpacity),
                      ],
                    ),
                  ),
                ),
                // Content
                Positioned(
                  left: AppSpacing.md,
                  bottom: AppSpacing.md,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icon != null) ...[
                        Container(
                          padding: AppSpacing.paddingXs,
                          decoration: BoxDecoration(
                            color: AppColors.white.withOpacity(0.2),
                            borderRadius: AppRadius.borderRadiusSm,
                          ),
                          child: Icon(
                            icon,
                            color: AppColors.white,
                            size: AppIcons.sizeMd,
                          ),
                        ),
                        AppSpacing.hGapSm,
                      ],
                      Text(
                        title,
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w600,
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

/// Reservation Card - Card showing reservation details (from Home screen)
class AppReservationCard extends StatelessWidget {
  const AppReservationCard({
    super.key,
    required this.reference,
    required this.courtName,
    required this.startTime,
    required this.endTime,
    required this.price,
    this.onTap,
  });

  final String reference;
  final String courtName;
  final String startTime;
  final String endTime;
  final String price;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      variant: AppCardVariant.outlined,
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: Row(
        children: [
          // Time badge
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.reservationTimeBadge,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(AppRadius.card),
                bottomLeft: Radius.circular(AppRadius.card),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  startTime,
                  style: AppTypography.titleMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  endTime,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          // Details
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Réf: $reference',
                    style: AppTypography.titleSmall,
                  ),
                  AppSpacing.vGapXxs,
                  Text(
                    '$courtName  |  $price',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Arrow
          Padding(
            padding: const EdgeInsets.only(right: AppSpacing.md),
            child: Icon(
              AppIcons.chevronRight,
              color: AppColors.iconTertiary,
              size: AppIcons.sizeMd,
            ),
          ),
        ],
      ),
    );
  }
}

/// Image Carousel Card - For the banner/slider on Home screen
class AppBannerCard extends StatelessWidget {
  const AppBannerCard({
    super.key,
    this.imageUrl,
    this.child,
    this.onTap,
    this.height = 180,
    this.borderRadius,
  });

  final String? imageUrl;
  final Widget? child;
  final VoidCallback? onTap;
  final double height;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final effectiveBorderRadius = borderRadius ?? AppRadius.cardBorderRadius;

    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: effectiveBorderRadius,
        boxShadow: AppShadows.imageShadow,
      ),
      child: ClipRRect(
        borderRadius: effectiveBorderRadius,
        child: Material(
          color: AppColors.neutral200,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Placeholder for image
                Container(
                  color: AppColors.neutral200,
                  child: Center(
                    child: Icon(
                      Icons.image,
                      size: 48,
                      color: AppColors.neutral400,
                    ),
                  ),
                ),
                // Navigation arrows overlay
                Positioned(
                  left: AppSpacing.sm,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: _NavigationArrow(
                      icon: AppIcons.chevronLeft,
                      onTap: () {},
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
                      onTap: () {},
                    ),
                  ),
                ),
                // Custom child overlay
                if (child != null) child!,
              ],
            ),
          ),
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
      color: AppColors.white.withOpacity(0.9),
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

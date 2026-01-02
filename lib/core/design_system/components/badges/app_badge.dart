import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';

/// Badge style variants
enum AppBadgeVariant { primary, secondary, success, warning, error, info }

/// Badge size variants
enum AppBadgeSize { small, medium, large }

/// PadelHouse Design System - Badge Component
/// 
/// Usage:
/// ```dart
/// AppBadge(
///   label: 'Nouveau',
///   variant: AppBadgeVariant.primary,
/// )
/// ```
class AppBadge extends StatelessWidget {
  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.primary,
    this.size = AppBadgeSize.medium,
    this.icon,
  });

  final String label;
  final AppBadgeVariant variant;
  final AppBadgeSize size;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: _getPadding(),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: AppRadius.chipBorderRadius,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: _getIconSize(),
              color: _getTextColor(),
            ),
            SizedBox(width: AppSpacing.xxs),
          ],
          Text(
            label,
            style: AppTypography.badge.copyWith(
              fontSize: _getFontSize(),
              color: _getTextColor(),
            ),
          ),
        ],
      ),
    );
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case AppBadgeSize.small:
        return const EdgeInsets.symmetric(horizontal: 6, vertical: 2);
      case AppBadgeSize.medium:
        return const EdgeInsets.symmetric(horizontal: 8, vertical: 4);
      case AppBadgeSize.large:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    }
  }

  double _getFontSize() {
    switch (size) {
      case AppBadgeSize.small:
        return 10;
      case AppBadgeSize.medium:
        return 11;
      case AppBadgeSize.large:
        return 12;
    }
  }

  double _getIconSize() {
    switch (size) {
      case AppBadgeSize.small:
        return 10;
      case AppBadgeSize.medium:
        return 12;
      case AppBadgeSize.large:
        return 14;
    }
  }

  Color _getBackgroundColor() {
    switch (variant) {
      case AppBadgeVariant.primary:
        return AppColors.brandPrimary;
      case AppBadgeVariant.secondary:
        return AppColors.brandSecondary;
      case AppBadgeVariant.success:
        return AppColors.success;
      case AppBadgeVariant.warning:
        return AppColors.warning;
      case AppBadgeVariant.error:
        return AppColors.error;
      case AppBadgeVariant.info:
        return AppColors.info;
    }
  }

  Color _getTextColor() {
    switch (variant) {
      case AppBadgeVariant.primary:
      case AppBadgeVariant.secondary:
      case AppBadgeVariant.success:
      case AppBadgeVariant.warning:
      case AppBadgeVariant.error:
      case AppBadgeVariant.info:
        return AppColors.white;
    }
  }
}

/// Notification Badge - Small dot indicator
class AppNotificationBadge extends StatelessWidget {
  const AppNotificationBadge({
    super.key,
    required this.child,
    this.count,
    this.showBadge = true,
    this.badgeColor,
    this.position = BadgePosition.topRight,
  });

  final Widget child;
  final int? count;
  final bool showBadge;
  final Color? badgeColor;
  final BadgePosition position;

  @override
  Widget build(BuildContext context) {
    if (!showBadge) return child;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: position == BadgePosition.topRight || position == BadgePosition.topLeft ? -4 : null,
          bottom: position == BadgePosition.bottomRight || position == BadgePosition.bottomLeft ? -4 : null,
          right: position == BadgePosition.topRight || position == BadgePosition.bottomRight ? -4 : null,
          left: position == BadgePosition.topLeft || position == BadgePosition.bottomLeft ? -4 : null,
          child: Container(
            constraints: BoxConstraints(
              minWidth: count != null ? 18 : 10,
              minHeight: count != null ? 18 : 10,
            ),
            padding: count != null 
                ? const EdgeInsets.symmetric(horizontal: 4, vertical: 2)
                : EdgeInsets.zero,
            decoration: BoxDecoration(
              color: badgeColor ?? AppColors.error,
              shape: count != null ? BoxShape.rectangle : BoxShape.circle,
              borderRadius: count != null ? BorderRadius.circular(9) : null,
              border: Border.all(
                color: AppColors.white,
                width: 1.5,
              ),
            ),
            child: count != null
                ? Center(
                    child: Text(
                      count! > 99 ? '99+' : count.toString(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.white,
                      ),
                    ),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

enum BadgePosition { topRight, topLeft, bottomRight, bottomLeft }

/// Status Badge - For showing status (online, offline, etc.)
class AppStatusBadge extends StatelessWidget {
  const AppStatusBadge({
    super.key,
    required this.status,
    this.showLabel = false,
  });

  final StatusType status;
  final bool showLabel;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _getColor(),
          ),
        ),
        if (showLabel) ...[
          SizedBox(width: AppSpacing.xxs),
          Text(
            _getLabel(),
            style: AppTypography.caption.copyWith(
              color: _getColor(),
            ),
          ),
        ],
      ],
    );
  }

  Color _getColor() {
    switch (status) {
      case StatusType.online:
        return AppColors.success;
      case StatusType.offline:
        return AppColors.neutral400;
      case StatusType.busy:
        return AppColors.error;
      case StatusType.away:
        return AppColors.warning;
    }
  }

  String _getLabel() {
    switch (status) {
      case StatusType.online:
        return 'En ligne';
      case StatusType.offline:
        return 'Hors ligne';
      case StatusType.busy:
        return 'Occupé';
      case StatusType.away:
        return 'Absent';
    }
  }
}

enum StatusType { online, offline, busy, away }

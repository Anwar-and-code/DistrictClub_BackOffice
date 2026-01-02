import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';

/// Avatar size variants
enum AppAvatarSize { xs, sm, md, lg, xl }

/// PadelHouse Design System - Avatar Component
/// 
/// Based on the Home screen showing user avatar with greeting.
/// 
/// Usage:
/// ```dart
/// AppAvatar(
///   imageUrl: 'https://...',
///   name: 'Alexandre KOFFI',
///   size: AppAvatarSize.md,
/// )
/// ```
class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.size = AppAvatarSize.md,
    this.onTap,
    this.showBorder = false,
    this.borderColor,
    this.backgroundColor,
  });

  final String? imageUrl;
  final String? name;
  final AppAvatarSize size;
  final VoidCallback? onTap;
  final bool showBorder;
  final Color? borderColor;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final avatarSize = _getSize();
    final fontSize = _getFontSize();
    final initials = _getInitials();

    Widget avatar = Container(
      width: avatarSize,
      height: avatarSize,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: backgroundColor ?? AppColors.brandSecondary.withOpacity(0.2),
        border: showBorder
            ? Border.all(
                color: borderColor ?? AppColors.white,
                width: _getBorderWidth(),
              )
            : null,
        image: imageUrl != null
            ? DecorationImage(
                image: NetworkImage(imageUrl!),
                fit: BoxFit.cover,
              )
            : null,
      ),
      child: imageUrl == null
          ? Center(
              child: Text(
                initials,
                style: TextStyle(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w600,
                  color: AppColors.brandPrimary,
                ),
              ),
            )
          : null,
    );

    if (onTap != null) {
      avatar = GestureDetector(
        onTap: onTap,
        child: avatar,
      );
    }

    return avatar;
  }

  String _getInitials() {
    if (name == null || name!.isEmpty) return '?';
    
    final parts = name!.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  double _getSize() {
    switch (size) {
      case AppAvatarSize.xs:
        return 24;
      case AppAvatarSize.sm:
        return 32;
      case AppAvatarSize.md:
        return 40;
      case AppAvatarSize.lg:
        return 56;
      case AppAvatarSize.xl:
        return 80;
    }
  }

  double _getFontSize() {
    switch (size) {
      case AppAvatarSize.xs:
        return 10;
      case AppAvatarSize.sm:
        return 12;
      case AppAvatarSize.md:
        return 14;
      case AppAvatarSize.lg:
        return 20;
      case AppAvatarSize.xl:
        return 28;
    }
  }

  double _getBorderWidth() {
    switch (size) {
      case AppAvatarSize.xs:
      case AppAvatarSize.sm:
        return 1.5;
      case AppAvatarSize.md:
        return 2;
      case AppAvatarSize.lg:
      case AppAvatarSize.xl:
        return 3;
    }
  }
}

/// User Header Widget - Avatar with greeting
/// Based on Home screen header showing "Hello, Alexandre KOFFI"
class AppUserHeader extends StatelessWidget {
  const AppUserHeader({
    super.key,
    required this.name,
    this.greeting = 'Hello,',
    this.avatarUrl,
    this.onAvatarTap,
    this.trailing,
  });

  final String name;
  final String greeting;
  final String? avatarUrl;
  final VoidCallback? onAvatarTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AppAvatar(
          imageUrl: avatarUrl,
          name: name,
          size: AppAvatarSize.lg,
          onTap: onAvatarTap,
        ),
        AppSpacing.hGapSm,
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                greeting,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                name,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

/// Avatar Group - For showing multiple avatars (e.g., participants)
class AppAvatarGroup extends StatelessWidget {
  const AppAvatarGroup({
    super.key,
    required this.avatars,
    this.maxDisplay = 4,
    this.size = AppAvatarSize.sm,
    this.onTap,
  });

  final List<AvatarData> avatars;
  final int maxDisplay;
  final AppAvatarSize size;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final displayCount = avatars.length > maxDisplay ? maxDisplay : avatars.length;
    final extraCount = avatars.length - maxDisplay;
    final overlap = _getOverlap();

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: _calculateWidth(displayCount, extraCount > 0),
        height: _getAvatarSize(),
        child: Stack(
          children: [
            ...List.generate(displayCount, (index) {
              return Positioned(
                left: index * (_getAvatarSize() - overlap),
                child: AppAvatar(
                  imageUrl: avatars[index].imageUrl,
                  name: avatars[index].name,
                  size: size,
                  showBorder: true,
                  borderColor: AppColors.white,
                ),
              );
            }),
            if (extraCount > 0)
              Positioned(
                left: displayCount * (_getAvatarSize() - overlap),
                child: Container(
                  width: _getAvatarSize(),
                  height: _getAvatarSize(),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.brandPrimary,
                    border: Border.all(
                      color: AppColors.white,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '+$extraCount',
                      style: TextStyle(
                        fontSize: _getFontSize(),
                        fontWeight: FontWeight.w600,
                        color: AppColors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  double _getAvatarSize() {
    switch (size) {
      case AppAvatarSize.xs:
        return 24;
      case AppAvatarSize.sm:
        return 32;
      case AppAvatarSize.md:
        return 40;
      case AppAvatarSize.lg:
        return 56;
      case AppAvatarSize.xl:
        return 80;
    }
  }

  double _getOverlap() {
    switch (size) {
      case AppAvatarSize.xs:
        return 8;
      case AppAvatarSize.sm:
        return 10;
      case AppAvatarSize.md:
        return 12;
      case AppAvatarSize.lg:
        return 16;
      case AppAvatarSize.xl:
        return 24;
    }
  }

  double _getFontSize() {
    switch (size) {
      case AppAvatarSize.xs:
        return 8;
      case AppAvatarSize.sm:
        return 10;
      case AppAvatarSize.md:
        return 12;
      case AppAvatarSize.lg:
        return 16;
      case AppAvatarSize.xl:
        return 20;
    }
  }

  double _calculateWidth(int count, bool hasExtra) {
    final avatarSize = _getAvatarSize();
    final overlap = _getOverlap();
    final totalAvatars = hasExtra ? count + 1 : count;
    return avatarSize + (totalAvatars - 1) * (avatarSize - overlap);
  }
}

/// Avatar data model
class AvatarData {
  const AvatarData({
    this.imageUrl,
    this.name,
  });

  final String? imageUrl;
  final String? name;
}

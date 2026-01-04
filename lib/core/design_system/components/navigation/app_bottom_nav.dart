import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';
import '../branding/app_logo.dart';

/// Navigation item data model
class AppNavItem {
  const AppNavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });

  final String label;
  final IconData icon;
  final IconData activeIcon;
}

/// PadelHouse Design System - Bottom Navigation Bar
/// 
/// Based on the Home screen mockup showing:
/// Accueil | Réservation | Événements | Contact
/// 
/// Usage:
/// ```dart
/// AppBottomNavBar(
///   currentIndex: 0,
///   onTap: (index) => setState(() => _currentIndex = index),
/// )
/// ```
class AppBottomNavBar extends StatelessWidget {
  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<AppNavItem>? items;

  static const List<AppNavItem> defaultItems = [
    AppNavItem(
      label: 'Accueil',
      icon: AppIcons.home,
      activeIcon: AppIcons.homeFilled,
    ),
    AppNavItem(
      label: 'Réservation',
      icon: AppIcons.reservation,
      activeIcon: AppIcons.reservationFilled,
    ),
    AppNavItem(
      label: 'Événements',
      icon: AppIcons.events,
      activeIcon: AppIcons.eventsFilled,
    ),
    AppNavItem(
      label: 'Contact',
      icon: AppIcons.contact,
      activeIcon: AppIcons.contactFilled,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final navItems = items ?? defaultItems;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.navBarBackground,
        boxShadow: AppShadows.navBarShadow,
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xs,
            vertical: AppSpacing.xs,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              navItems.length,
              (index) => Expanded(
                child: _NavBarItem(
                  item: navItems[index],
                  isActive: index == currentIndex,
                  onTap: () => onTap(index),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  const _NavBarItem({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  final AppNavItem item;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.borderRadiusMd,
      child: AnimatedContainer(
        duration: AppAnimations.navBarDuration,
        curve: AppAnimations.navBarCurve,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: isActive 
              ? AppColors.navBarItemActiveBackground 
              : Colors.transparent,
          borderRadius: AppRadius.borderRadiusMd,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: AppAnimations.durationFast,
              child: Icon(
                isActive ? item.activeIcon : item.icon,
                key: ValueKey(isActive),
                size: AppIcons.navBarIcon,
                color: isActive 
                    ? AppColors.navBarItemActive 
                    : AppColors.navBarItemInactive,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.visible,
              textAlign: TextAlign.center,
              style: AppTypography.navLabel.copyWith(
                color: isActive 
                    ? AppColors.navBarItemActive 
                    : AppColors.navBarItemInactive,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// App Bar with logo - Based on Home screen header
class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({
    super.key,
    this.title,
    this.showLogo = true,
    this.leading,
    this.actions,
    this.centerTitle = true,
    this.backgroundColor,
    this.elevation = 0,
  });

  final String? title;
  final bool showLogo;
  final Widget? leading;
  final List<Widget>? actions;
  final bool centerTitle;
  final Color? backgroundColor;
  final double elevation;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: leading,
      title: showLogo ? const AppLogo() : (title != null ? Text(title!) : null),
      centerTitle: centerTitle,
      backgroundColor: backgroundColor ?? AppColors.backgroundPrimary,
      elevation: elevation,
      scrolledUnderElevation: 0,
      actions: actions,
    );
  }
}



/// Page indicator dots - For carousel/slider
class AppPageIndicator extends StatelessWidget {
  const AppPageIndicator({
    super.key,
    required this.count,
    required this.currentIndex,
    this.activeColor,
    this.inactiveColor,
    this.size = 8,
    this.spacing = 8,
  });

  final int count;
  final int currentIndex;
  final Color? activeColor;
  final Color? inactiveColor;
  final double size;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        count,
        (index) => AnimatedContainer(
          duration: AppAnimations.durationNormal,
          margin: EdgeInsets.symmetric(horizontal: spacing / 2),
          width: index == currentIndex ? size * 2.5 : size,
          height: size,
          decoration: BoxDecoration(
            color: index == currentIndex
                ? (activeColor ?? AppColors.brandSecondary)
                : (inactiveColor ?? AppColors.neutral300),
            borderRadius: BorderRadius.circular(size / 2),
          ),
        ),
      ),
    );
  }
}

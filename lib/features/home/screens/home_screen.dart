import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../widgets/home_banner_carousel.dart';
import '../widgets/home_action_cards.dart';
import '../widgets/home_reservations_list.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with logo and notification
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.screenPaddingHorizontal,
                  vertical: AppSpacing.md,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const AppLogo(
                      size: AppLogoSize.medium,
                      color: AppColors.brandPrimary,
                    ),
                    AppNotificationBadge(
                      showBadge: true,
                      count: 3,
                      child: AppIconButton(
                        icon: AppIcons.notification,
                        onPressed: () {},
                        variant: AppButtonVariant.ghost,
                      ),
                    ),
                  ],
                ),
              ),

              // User greeting
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: AppUserHeader(
                  name: 'Alexandre KOFFI',
                  greeting: 'Hello,',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                  onAvatarTap: () {
                    // Navigate to profile
                  },
                ),
              ),

              AppSpacing.vGapLg,

              // Banner Carousel
              const HomeBannerCarousel(),

              AppSpacing.vGapXl,

              // Let's Padel Section
              const Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: HomeActionCards(),
              ),

              AppSpacing.vGapXl,

              // Dernières réservations
              const Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: HomeReservationsList(),
              ),

              AppSpacing.vGapXxl,
            ],
          ),
        ),
      ),
    );
  }
}

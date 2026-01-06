import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import '../../../features/auth/screens/email_screen.dart';
import 'settings_screen.dart';
import 'personal_info_screen.dart';
import 'favorites_screen.dart';
import 'help_center_screen.dart';
import 'about_screen.dart';
import 'legal_screen.dart';
import 'notifications_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header with back button and settings
              Container(
                height: 56,
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Row(
                  children: [
                    // Back Button (Leading)
                    AppIconButton(
                      icon: AppIcons.arrowBack,
                      onPressed: () => Navigator.of(context).pop(),
                      variant: AppButtonVariant.ghost,
                    ),
                    
                    // Title (Centered with Expanded)
                    Expanded(
                      child: Text(
                        'Profil',
                        style: AppTypography.titleLarge,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    
                    // Settings Button (Trailing)
                    AppIconButton(
                      icon: AppIcons.settings,
                      onPressed: () {
                        context.navigateSlide(
                          const SettingsScreen(),
                          routeName: '/settings',
                        );
                      },
                      variant: AppButtonVariant.ghost,
                    ),
                  ],
                ),
              ),

              AppSpacing.vGapLg,

              // Profile info
              const _ProfileHeader(),

              AppSpacing.vGapXl,

              // Quick stats
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Row(
                  children: [
                    _StatCard(
                      label: 'Réservations',
                      value: '24',
                      icon: AppIcons.reservationFilled,
                      color: AppColors.brandPrimary,
                    ),
                    AppSpacing.hGapMd,
                    _StatCard(
                      label: 'Événements',
                      value: '8',
                      icon: AppIcons.eventsFilled,
                      color: AppColors.brandSecondary,
                    ),
                    AppSpacing.hGapMd,
                    _StatCard(
                      label: 'Heures jouées',
                      value: '36',
                      icon: AppIcons.timer,
                      color: AppColors.success,
                    ),
                  ],
                ),
              ),

              AppSpacing.vGapXl,

              // Menu options
              const _ProfileMenuSection(),

              AppSpacing.vGapXl,

              // Logout button
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: AppButton(
                  label: 'Se déconnecter',
                  icon: AppIcons.logout,
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Se déconnecter'),
                        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Annuler'),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                              // Logout uses phase transition (milestone)
                              Navigator.of(context).pushAndRemoveUntil(
                                AppPageRoute(
                                  page: const EmailScreen(),
                                  transitionType: PageTransitionType.phase,
                                  settings: const RouteSettings(name: '/auth/email'),
                                ),
                                (route) => false,
                              );
                            },
                            child: const Text(
                              'Déconnexion',
                              style: TextStyle(color: AppColors.error),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                  variant: AppButtonVariant.outline,
                  isFullWidth: true,
                ),
              ),

              AppSpacing.vGapXxl,
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Avatar
        Stack(
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.brandPrimary,
                  width: 3,
                ),
                image: const DecorationImage(
                  image: NetworkImage(
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.white,
                    width: 2,
                  ),
                ),
                child: const Icon(
                  AppIcons.camera,
                  size: 16,
                  color: AppColors.white,
                ),
              ),
            ),
          ],
        ),

        AppSpacing.vGapMd,

        // Name and info
        Text(
          'Alexandre KOFFI',
          style: AppTypography.headlineSmall,
        ),
        AppSpacing.vGapXxs,
        Text(
          'alexandre.koffi@email.com',
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.vGapXs,
        Text(
          '+225 07 77 46 56 00',
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),

        AppSpacing.vGapMd,

        // Membership badge
        AppBadge(
          label: 'Membre Premium',
          variant: AppBadgeVariant.success,
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: AppRadius.cardBorderRadius,
          boxShadow: AppShadows.cardShadow,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 24,
            ),
            AppSpacing.vGapXs,
            Text(
              value,
              style: AppTypography.headlineMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              label,
              style: AppTypography.caption,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMenuSection extends StatelessWidget {
  const _ProfileMenuSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: AppSpacing.screenPaddingHorizontalOnly,
          child: AppSectionHeader(title: 'Mon compte'),
        ),
        AppSpacing.vGapMd,
        _MenuItem(
          icon: AppIcons.profile,
          title: 'Informations personnelles',
          onTap: () {
            context.navigateSlide(
              const PersonalInfoScreen(),
              routeName: '/profile/personal-info',
            );
          },
        ),
        _MenuItem(
          icon: AppIcons.history,
          title: 'Historique des réservations',
          onTap: () {
            // Navigate to reservation tab via bottom nav
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(AppIcons.calendar, color: AppColors.white),
                    AppSpacing.hGapSm,
                    Expanded(child: Text('Rendez-vous dans l\'onglet "Réservations"')),
                  ],
                ),
                backgroundColor: AppColors.brandPrimary,
                duration: const Duration(seconds: 2),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        ),
        _MenuItem(
          icon: AppIcons.favorite,
          title: 'Favoris',
          onTap: () {
            context.navigateSlide(
              const FavoritesScreen(),
              routeName: '/profile/favorites',
            );
          },
        ),
        _MenuItem(
          icon: AppIcons.notification,
          title: 'Notifications',
          onTap: () {
            context.navigateSlide(
              const NotificationsScreen(),
              routeName: '/notifications',
            );
          },
        ),

        AppSpacing.vGapXl,

        const Padding(
          padding: AppSpacing.screenPaddingHorizontalOnly,
          child: AppSectionHeader(title: 'Support'),
        ),
        AppSpacing.vGapMd,
        _MenuItem(
          icon: AppIcons.help,
          title: 'Centre d\'aide',
          onTap: () {
            context.navigateSlide(
              const HelpCenterScreen(),
              routeName: '/help',
            );
          },
        ),
        _MenuItem(
          icon: AppIcons.info,
          title: 'À propos',
          onTap: () {
            context.navigateSlide(
              const AboutScreen(),
              routeName: '/about',
            );
          },
        ),
        _MenuItem(
          icon: AppIcons.share,
          title: 'Partager l\'application',
          onTap: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: AppColors.backgroundPrimary,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
              ),
              builder: (context) => Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Partager PadelHouse',
                      style: AppTypography.headlineSmall,
                    ),
                    AppSpacing.vGapMd,
                    Text(
                      'Invitez vos amis à rejoindre la communauté PadelHouse !',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    AppSpacing.vGapLg,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _ShareOption(icon: Icons.message, label: 'SMS', onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Lien copié !'), backgroundColor: AppColors.success),
                          );
                        }),
                        _ShareOption(icon: Icons.email, label: 'Email', onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Lien copié !'), backgroundColor: AppColors.success),
                          );
                        }),
                        _ShareOption(icon: Icons.copy, label: 'Copier', onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Lien copié dans le presse-papier'), backgroundColor: AppColors.success),
                          );
                        }),
                        _ShareOption(icon: Icons.more_horiz, label: 'Plus', onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Partage...'), backgroundColor: AppColors.brandPrimary),
                          );
                        }),
                      ],
                    ),
                    AppSpacing.vGapLg,
                  ],
                ),
              ),
            );
          },
        ),

        AppSpacing.vGapXl,

        const Padding(
          padding: AppSpacing.screenPaddingHorizontalOnly,
          child: AppSectionHeader(title: 'Légal'),
        ),
        AppSpacing.vGapMd,
        _MenuItem(
          icon: Icons.description_outlined,
          title: 'Conditions d\'utilisation',
          onTap: () {
            context.navigateSlide(
              const TermsOfServiceScreen(),
              routeName: '/legal/terms',
            );
          },
        ),
        _MenuItem(
          icon: Icons.privacy_tip_outlined,
          title: 'Politique de confidentialité',
          onTap: () {
            context.navigateSlide(
              const PrivacyPolicyScreen(),
              routeName: '/legal/privacy',
            );
          },
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.title,
    this.onTap,
    this.trailing,
    this.showChevron = true,
  });

  final IconData icon;
  final String title;
  final VoidCallback? onTap;
  final Widget? trailing;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: AppSpacing.screenPaddingHorizontalOnly,
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.cardBorderRadius,
          child: Padding(
            padding: AppSpacing.cardPaddingAll,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Icon(
                    icon,
                    size: 20,
                    color: AppColors.brandPrimary,
                  ),
                ),
                AppSpacing.hGapMd,
                Expanded(
                  child: Text(
                    title,
                    style: AppTypography.bodyMedium,
                  ),
                ),
                if (trailing != null)
                  trailing!
                else if (showChevron)
                  Icon(
                    AppIcons.chevronRight,
                    color: AppColors.iconTertiary,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ShareOption extends StatelessWidget {
  const _ShareOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.brandPrimary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.brandPrimary),
          ),
          AppSpacing.vGapXs,
          Text(
            label,
            style: AppTypography.caption,
          ),
        ],
      ),
    );
  }
}

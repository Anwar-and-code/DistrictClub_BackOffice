import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

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
                        AppComingSoonModal.show(context);
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
                              Navigator.of(context).pushNamedAndRemoveUntil(
                                '/auth/email',
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
            AppComingSoonModal.show(context);
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
            AppComingSoonModal.show(context);
          },
        ),
        _MenuItem(
          icon: AppIcons.notification,
          title: 'Notifications',
          trailing: Switch(
            value: true,
            onChanged: (value) {},
            activeThumbColor: AppColors.brandPrimary,
          ),
          showChevron: false,
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
            AppComingSoonModal.show(context);
          },
        ),
        _MenuItem(
          icon: AppIcons.info,
          title: 'À propos',
          onTap: () {
            AppComingSoonModal.show(context);
          },
        ),
        _MenuItem(
          icon: AppIcons.share,
          title: 'Partager l\'application',
          onTap: () {
            AppComingSoonModal.show(context);
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
            AppComingSoonModal.show(context);
          },
        ),
        _MenuItem(
          icon: Icons.privacy_tip_outlined,
          title: 'Politique de confidentialité',
          onTap: () {
            AppComingSoonModal.show(context);
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

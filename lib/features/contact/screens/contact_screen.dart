import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        title: Text(
          'Contact',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.screenPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Club info card
            _ClubInfoCard(),

            AppSpacing.vGapXl,

            // Contact options
            const AppSectionHeader(title: 'Nous contacter'),
            AppSpacing.vGapMd,

            _ContactOption(
              icon: Icons.phone_outlined,
              title: 'Téléphone',
              subtitle: '+225 07 77 46 56 00',
              onTap: () {},
            ),
            AppSpacing.vGapSm,
            _ContactOption(
              icon: Icons.email_outlined,
              title: 'Email',
              subtitle: 'contact@padelhouse.ci',
              onTap: () {},
            ),
            AppSpacing.vGapSm,
            _ContactOption(
              icon: Icons.language,
              title: 'Site web',
              subtitle: 'www.padelhouse.ci',
              onTap: () {},
            ),

            AppSpacing.vGapXl,

            // Social media
            const AppSectionHeader(title: 'Réseaux sociaux'),
            AppSpacing.vGapMd,

            Row(
              children: [
                _SocialButton(
                  icon: Icons.facebook,
                  label: 'Facebook',
                  color: const Color(0xFF1877F2),
                  onTap: () {},
                ),
                AppSpacing.hGapMd,
                _SocialButton(
                  icon: Icons.camera_alt_outlined,
                  label: 'Instagram',
                  color: const Color(0xFFE4405F),
                  onTap: () {},
                ),
                AppSpacing.hGapMd,
                _SocialButton(
                  icon: Icons.play_arrow,
                  label: 'TikTok',
                  color: AppColors.black,
                  onTap: () {},
                ),
              ],
            ),

            AppSpacing.vGapXl,

            // Opening hours
            const AppSectionHeader(title: 'Horaires d\'ouverture'),
            AppSpacing.vGapMd,

            _HoursCard(),

            AppSpacing.vGapXl,

            // Send message
            const AppSectionHeader(title: 'Envoyer un message'),
            AppSpacing.vGapMd,

            const AppTextField(
              label: 'Sujet',
              hint: 'Ex: Question sur les réservations',
            ),
            AppSpacing.vGapMd,
            const AppTextField(
              label: 'Message',
              hint: 'Écrivez votre message ici...',
              maxLines: 4,
            ),
            AppSpacing.vGapMd,

            AppButton(
              label: 'Envoyer',
              icon: Icons.send,
              iconPosition: IconPosition.trailing,
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Message envoyé !'),
                    backgroundColor: AppColors.success,
                  ),
                );
              },
              variant: AppButtonVariant.primary,
              isFullWidth: true,
            ),

            AppSpacing.vGapXxl,
          ],
        ),
      ),
    );
  }
}

class _ClubInfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardBorderRadius,
        boxShadow: AppShadows.shadowMd,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.cardBorderRadius,
        child: Column(
          children: [
            // Map/Image
            SizedBox(
              height: 150,
              width: double.infinity,
              child: Image.network(
                'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: AppColors.neutral200,
                  child: Icon(
                    Icons.map_outlined,
                    size: 48,
                    color: AppColors.neutral400,
                  ),
                ),
              ),
            ),

            // Info
            Container(
              color: AppColors.cardBackground,
              padding: AppSpacing.cardPaddingAll,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const AppLogo(
                        size: AppLogoSize.small,
                      ),
                      const Spacer(),
                      AppBadge(
                        label: 'Ouvert',
                        variant: AppBadgeVariant.success,
                      ),
                    ],
                  ),
                  AppSpacing.vGapMd,
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 18,
                        color: AppColors.iconSecondary,
                      ),
                      AppSpacing.hGapXs,
                      Expanded(
                        child: Text(
                          'Cocody Riviera Golf, Abidjan, Côte d\'Ivoire',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.vGapMd,
                  AppButton(
                    label: 'Voir sur la carte',
                    icon: Icons.directions,
                    onPressed: () {},
                    variant: AppButtonVariant.outline,
                    isFullWidth: true,
                    size: AppButtonSize.small,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactOption extends StatelessWidget {
  const _ContactOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
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
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Icon(
                    icon,
                    color: AppColors.brandPrimary,
                  ),
                ),
                AppSpacing.hGapMd,
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTypography.labelMedium,
                      ),
                      Text(
                        subtitle,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
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

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: AppRadius.borderRadiusMd,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: AppRadius.borderRadiusMd,
          child: InkWell(
            onTap: onTap,
            borderRadius: AppRadius.borderRadiusMd,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                vertical: AppSpacing.md,
              ),
              child: Column(
                children: [
                  Icon(
                    icon,
                    color: AppColors.white,
                    size: 24,
                  ),
                  AppSpacing.vGapXs,
                  Text(
                    label,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HoursCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.cardPaddingAll,
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.cardBorderRadius,
      ),
      child: Column(
        children: [
          _buildHourRow('Lundi - Vendredi', '08:00 - 23:30'),
          AppSpacing.vGapSm,
          _buildHourRow('Samedi', '08:00 - 23:30'),
          AppSpacing.vGapSm,
          _buildHourRow('Dimanche', '09:00 - 22:00'),
        ],
      ),
    );
  }

  Widget _buildHourRow(String day, String hours) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          day,
          style: AppTypography.bodyMedium,
        ),
        Text(
          hours,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.brandPrimary,
          ),
        ),
      ],
    );
  }
}

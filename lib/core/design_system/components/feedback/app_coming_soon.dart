import 'package:flutter/material.dart';
import '../../design_system.dart';

class AppComingSoonModal extends StatelessWidget {
  const AppComingSoonModal({
    super.key,
    this.title = 'Bientôt disponible',
    this.description = 'Nous travaillons dur pour vous apporter cette fonctionnalité incroyable. Restez à l\'écoute !',
    this.icon = AppIcons.info,
  });

  final String title;
  final String description;
  final IconData icon;

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => const AppComingSoonModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.brandPrimary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 40,
              color: AppColors.brandPrimary,
            ),
          ),
          AppSpacing.vGapLg,
          Text(
            title,
            style: AppTypography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          AppSpacing.vGapSm,
          Text(
            description,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          AppSpacing.vGapXl,
          AppButton(
            label: 'Prévenez-moi',
            icon: AppIcons.notification,
            isFullWidth: true,
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Vous serez notifié dès que cette fonctionnalité sera disponible !'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
          ),
          AppSpacing.vGapMd,
          AppButton(
            label: 'Fermer',
            variant: AppButtonVariant.ghost,
            isFullWidth: true,
            onPressed: () => Navigator.pop(context),
          ),
          AppSpacing.vGapLg,
        ],
      ),
    );
  }
}


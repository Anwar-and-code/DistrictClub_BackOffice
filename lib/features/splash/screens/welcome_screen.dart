import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
            children: [
              const Spacer(flex: 1),
              
              // Logo
              const AppLogo(
                size: AppLogoSize.large,
                color: AppColors.brandPrimary,
              ),
              
              const Spacer(flex: 1),
              
              // Illustration - Padel court image
              Container(
                height: 280,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: AppRadius.borderRadiusXl,
                  boxShadow: AppShadows.shadowMd,
                ),
                child: ClipRRect(
                  borderRadius: AppRadius.borderRadiusXl,
                  child: Image.network(
                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.neutral200,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              AppIcons.sportsTennis,
                              size: 64,
                              color: AppColors.brandPrimary,
                            ),
                            AppSpacing.vGapMd,
                            Text(
                              'Terrain de Padel',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: AppColors.neutral100,
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                            color: AppColors.brandPrimary,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              
              const Spacer(flex: 1),
              
              // Welcome text
              Text(
                'Envie de vous défouler ?',
                style: AppTypography.headlineSmall.copyWith(
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              AppSpacing.vGapXs,
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: AppTypography.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  children: [
                    const TextSpan(text: 'Une séance de '),
                    TextSpan(
                      text: 'padel',
                      style: TextStyle(
                        color: AppColors.brandSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const TextSpan(text: " s'impose !"),
                  ],
                ),
              ),
              
              const Spacer(flex: 2),
              
              // CTA Button
              AppButton(
                label: 'Commencer',
                onPressed: () {
                  Navigator.of(context).pushNamed('/auth/phone');
                },
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
              ),
              
              AppSpacing.vGapLg,
            ],
          ),
        ),
      ),
    );
  }
}

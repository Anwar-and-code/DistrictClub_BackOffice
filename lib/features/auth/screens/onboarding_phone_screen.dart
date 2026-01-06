import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import '../../../app/main_shell.dart';

class OnboardingPhoneScreen extends StatefulWidget {
  final String email;
  final String prenom;
  final String nom;
  final DateTime birthDate;
  
  const OnboardingPhoneScreen({
    super.key,
    required this.email,
    required this.prenom,
    required this.nom,
    required this.birthDate,
  });

  @override
  State<OnboardingPhoneScreen> createState() => _OnboardingPhoneScreenState();
}

class _OnboardingPhoneScreenState extends State<OnboardingPhoneScreen> {
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onContinue() {
    // Save user data here (integrate with backend/local storage)
    // User data available:
    // - widget.email
    // - widget.prenom
    // - widget.nom
    // - widget.birthDate
    // - _phoneController.text
    
    // Navigate to main app with phase transition for milestone completion
    Navigator.of(context).pushAndRemoveUntil(
      AppPageRoute(
        page: const MainShell(),
        transitionType: PageTransitionType.phase,
        settings: const RouteSettings(name: '/main'),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFormValid = _phoneController.text.length >= 8;

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(AppIcons.arrowBack),
          onPressed: () => Navigator.of(context).pop(),
          color: AppColors.iconPrimary,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: AppSpacing.screenPadding,
          child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        // Logo
                        const AppLogo(
                          size: AppLogoSize.medium,
                        ),
                        
                        AppSpacing.vGapXxl,
                        
                        // Icon
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSubtle,
                            borderRadius: AppRadius.borderRadiusLg,
                          ),
                          child: Icon(
                            Icons.phone_outlined,
                            size: 40,
                            color: AppColors.brandPrimary,
                          ),
                        ),
                        
                        AppSpacing.vGapXl,
                        
                        // Title
                        Text(
                          'Numéro de téléphone',
                          style: AppTypography.titleLarge,
                          textAlign: TextAlign.center,
                        ),
                        
                        AppSpacing.vGapXs,
                        
                        // Subtitle
                        Text(
                          'Entrez votre numéro de téléphone mobile',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        
                        AppSpacing.vGapXxl,
                        
                        // Phone input
                        AppPhoneField(
                          controller: _phoneController,
                          label: 'Numéro mobile',
                          hint: '07 77 46 56 00',
                          onChanged: (value) => setState(() {}),
                        ),
                        
                        AppSpacing.vGapXl,
                        
                        // Progress indicator
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildProgressDot(true),
                            AppSpacing.hGapXs,
                            _buildProgressDot(true),
                            AppSpacing.hGapXs,
                            _buildProgressDot(true),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Continue button
                AppButton(
                  label: 'Terminer',
                  onPressed: isFormValid ? _onContinue : null,
                  variant: AppButtonVariant.primary,
                  size: AppButtonSize.large,
                  isFullWidth: true,
                  isDisabled: !isFormValid,
                ),
                
                AppSpacing.vGapLg,
              ],
            ),
          ),
        ),
    );
  }

  Widget _buildProgressDot(bool isActive) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.brandPrimary : AppColors.neutral300,
        shape: BoxShape.circle,
      ),
    );
  }
}

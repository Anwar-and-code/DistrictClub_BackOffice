import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import 'onboarding_birthdate_screen.dart';

class OnboardingNameScreen extends StatefulWidget {
  final String email;
  
  const OnboardingNameScreen({
    super.key,
    required this.email,
  });

  @override
  State<OnboardingNameScreen> createState() => _OnboardingNameScreenState();
}

class _OnboardingNameScreenState extends State<OnboardingNameScreen> {
  final _formKey = GlobalKey<FormState>();
  final _prenomController = TextEditingController();
  final _nomController = TextEditingController();

  @override
  void dispose() {
    _prenomController.dispose();
    _nomController.dispose();
    super.dispose();
  }

  void _onContinue() {
    if (_formKey.currentState?.validate() ?? false) {
      context.navigateSlide(
        OnboardingBirthdateScreen(
          email: widget.email,
          prenom: _prenomController.text,
          nom: _nomController.text,
        ),
        routeName: '/auth/onboarding/birthdate',
      );
    }
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ce champ est requis';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final isFormValid = _prenomController.text.isNotEmpty && 
                        _nomController.text.isNotEmpty;

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
          child: Form(
            key: _formKey,
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
                            Icons.person_outline,
                            size: 40,
                            color: AppColors.brandPrimary,
                          ),
                        ),
                        
                        AppSpacing.vGapXl,
                        
                        // Title
                        Text(
                          'Vos informations',
                          style: AppTypography.titleLarge,
                          textAlign: TextAlign.center,
                        ),
                        
                        AppSpacing.vGapXs,
                        
                        // Subtitle
                        Text(
                          'Commençons par votre nom',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        
                        AppSpacing.vGapXxl,
                        
                        // Prénom field
                        AppTextField(
                          controller: _prenomController,
                          label: 'Prénom',
                          hint: 'Entrez votre prénom',
                          prefixIcon: Icons.person_outline,
                          textCapitalization: TextCapitalization.words,
                          validator: _validateName,
                          onChanged: (value) => setState(() {}),
                        ),
                        
                        AppSpacing.vGapMd,
                        
                        // Nom field
                        AppTextField(
                          controller: _nomController,
                          label: 'Nom',
                          hint: 'Entrez votre nom',
                          prefixIcon: Icons.person_outline,
                          textCapitalization: TextCapitalization.words,
                          validator: _validateName,
                          onChanged: (value) => setState(() {}),
                        ),
                        
                        AppSpacing.vGapXl,
                        
                        // Progress indicator
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildProgressDot(true),
                            AppSpacing.hGapXs,
                            _buildProgressDot(false),
                            AppSpacing.hGapXs,
                            _buildProgressDot(false),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Continue button
                AppButton(
                  label: 'Suivant',
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

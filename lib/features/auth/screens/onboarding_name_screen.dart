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
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Column(
          children: [
            // Header fixe avec back button et logo
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(AppIcons.arrowBack),
                    onPressed: () => Navigator.of(context).pop(),
                    color: AppColors.iconPrimary,
                  ),
                  const Expanded(
                    child: Center(
                      child: AppLogo(size: AppLogoSize.small),
                    ),
                  ),
                  const SizedBox(width: 48), // Balance pour centrer le logo
                ],
              ),
            ),
            
            // Contenu scrollable
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.only(
                  left: AppSpacing.lg,
                  right: AppSpacing.lg,
                  bottom: bottomPadding > 0 ? bottomPadding + 80 : AppSpacing.lg,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      AppSpacing.vGapLg,
                      
                      // Title
                      Text(
                        'Vos informations',
                        style: AppTypography.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                      
                      AppSpacing.vGapXs,
                      
                      // Subtitle
                      Text(
                        'Commençons par votre nom',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      AppSpacing.vGapXxl,
                      
                      // Nom field
                      AppTextField(
                        controller: _nomController,
                        label: 'Nom',
                        hint: 'Entrez votre nom',
                        prefixIcon: Icons.person_outline,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        validator: _validateName,
                        onChanged: (value) => setState(() {}),
                      ),
                      
                      AppSpacing.vGapMd,
                      
                      // Prénom field
                      AppTextField(
                        controller: _prenomController,
                        label: 'Prénom',
                        hint: 'Entrez votre prénom',
                        prefixIcon: Icons.person_outline,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.done,
                        validator: _validateName,
                        onChanged: (value) => setState(() {}),
                        onSubmitted: (_) {
                          if (isFormValid) _onContinue();
                        },
                      ),
                      
                      AppSpacing.vGapXxl,
                      
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
            ),
            
            // Bouton fixe en bas
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                bottom: bottomPadding > 0 ? AppSpacing.sm : AppSpacing.lg,
                top: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: AppColors.backgroundPrimary,
                boxShadow: bottomPadding > 0 ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ] : null,
              ),
              child: AppButton(
                label: 'Suivant',
                onPressed: isFormValid ? _onContinue : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isDisabled: !isFormValid,
              ),
            ),
          ],
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

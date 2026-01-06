import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import 'onboarding_phone_screen.dart';

class OnboardingBirthdateScreen extends StatefulWidget {
  final String email;
  final String prenom;
  final String nom;
  
  const OnboardingBirthdateScreen({
    super.key,
    required this.email,
    required this.prenom,
    required this.nom,
  });

  @override
  State<OnboardingBirthdateScreen> createState() => _OnboardingBirthdateScreenState();
}

class _OnboardingBirthdateScreenState extends State<OnboardingBirthdateScreen> {
  DateTime? _selectedDate;
  String? _displayDate;

  void _onContinue() {
    if (_selectedDate != null) {
      context.navigateSlide(
        OnboardingPhoneScreen(
          email: widget.email,
          prenom: widget.prenom,
          nom: widget.nom,
          birthDate: _selectedDate!,
        ),
        routeName: '/auth/onboarding/phone',
      );
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.brandPrimary,
              onPrimary: AppColors.white,
              surface: AppColors.surfaceDefault,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _displayDate = _formatDate(picked);
      });
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return '${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
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
                          Icons.cake_outlined,
                          size: 40,
                          color: AppColors.brandPrimary,
                        ),
                      ),
                      
                      AppSpacing.vGapXl,
                      
                      // Title
                      Text(
                        'Date de naissance',
                        style: AppTypography.titleLarge,
                        textAlign: TextAlign.center,
                      ),
                      
                      AppSpacing.vGapXs,
                      
                      // Subtitle
                      Text(
                        'Sélectionnez votre date de naissance',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      AppSpacing.vGapXxl,
                      
                      // Date picker field
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Date de naissance',
                            style: AppTypography.inputLabel,
                          ),
                          AppSpacing.vGapXs,
                          GestureDetector(
                            onTap: _selectDate,
                            child: Container(
                              padding: AppSpacing.inputPadding,
                              decoration: BoxDecoration(
                                color: AppColors.inputBackground,
                                borderRadius: AppRadius.inputBorderRadius,
                                border: Border.all(
                                  color: _selectedDate != null 
                                      ? AppColors.brandPrimary 
                                      : AppColors.inputBorder,
                                  width: _selectedDate != null ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.calendar_today_outlined,
                                    size: AppIcons.inputIcon,
                                    color: _selectedDate != null 
                                        ? AppColors.brandPrimary 
                                        : AppColors.iconSecondary,
                                  ),
                                  AppSpacing.hGapMd,
                                  Expanded(
                                    child: Text(
                                      _displayDate ?? 'Sélectionnez une date',
                                      style: _selectedDate != null
                                          ? AppTypography.inputText
                                          : AppTypography.inputHint,
                                    ),
                                  ),
                                  Icon(
                                    Icons.arrow_drop_down,
                                    color: AppColors.iconSecondary,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
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
                onPressed: _selectedDate != null ? _onContinue : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isDisabled: _selectedDate == null,
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

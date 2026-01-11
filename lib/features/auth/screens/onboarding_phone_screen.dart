import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  String _phoneNumber = '';
  String? _errorMessage;

  bool get _isValidPrefix {
    if (_phoneNumber.length < 2) return true; // Pas encore assez pour valider
    final prefix = _phoneNumber.substring(0, 2);
    return prefix == '01' || prefix == '05' || prefix == '07';
  }

  bool get _isFormValid {
    return _phoneNumber.length == 10 && _isValidPrefix;
  }

  void _onKeyPressed(String key) {
    if (_phoneNumber.length < 10) {
      setState(() {
        _phoneNumber += key;
        _validatePhone();
      });
    }
  }

  void _onBackspace() {
    if (_phoneNumber.isNotEmpty) {
      setState(() {
        _phoneNumber = _phoneNumber.substring(0, _phoneNumber.length - 1);
        _validatePhone();
      });
    }
  }

  void _validatePhone() {
    if (_phoneNumber.length == 10) {
      if (!_isValidPrefix) {
        _errorMessage = 'Le numéro doit commencer par 01, 05 ou 07';
      } else {
        _errorMessage = null;
      }
    } else if (_phoneNumber.length >= 2 && !_isValidPrefix) {
      _errorMessage = 'Le numéro doit commencer par 01, 05 ou 07';
    } else {
      _errorMessage = null;
    }
  }

  String get _formattedPhone {
    if (_phoneNumber.isEmpty) return '';
    String formatted = '';
    for (int i = 0; i < _phoneNumber.length; i++) {
      if (i > 0 && i % 2 == 0) formatted += ' ';
      formatted += _phoneNumber[i];
    }
    return formatted;
  }

  void _onContinue() {
    if (!_isFormValid) return;
    
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
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Column(
          children: [
            // Header
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
                  const SizedBox(width: 48),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Column(
                  children: [
                    AppSpacing.vGapLg,
                    
                    // Title
                    Text(
                      'Numéro de téléphone',
                      style: AppTypography.headlineMedium,
                      textAlign: TextAlign.center,
                    ),
                    
                    AppSpacing.vGapXs,
                    
                    // Subtitle
                    Text(
                      'Entrez votre numéro de téléphone mobile',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    AppSpacing.vGapXxl,
                    
                    // Phone display
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Numéro mobile',
                          style: AppTypography.inputLabel,
                        ),
                        AppSpacing.vGapXs,
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.md,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.inputBackground,
                            borderRadius: AppRadius.inputBorderRadius,
                            border: Border.all(
                              color: _errorMessage != null 
                                  ? AppColors.error 
                                  : _phoneNumber.isNotEmpty 
                                      ? AppColors.brandPrimary 
                                      : AppColors.inputBorder,
                              width: _phoneNumber.isNotEmpty ? 1.5 : 1,
                            ),
                          ),
                          child: Text(
                            _phoneNumber.isEmpty ? '07 XX XX XX XX' : _formattedPhone,
                            style: _phoneNumber.isEmpty
                                ? AppTypography.inputHint
                                : AppTypography.titleMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 1,
                                  ),
                          ),
                        ),
                        if (_errorMessage != null) ...[
                          AppSpacing.vGapXs,
                          Text(
                            _errorMessage!,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.error,
                            ),
                          ),
                        ],
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
                        _buildProgressDot(true),
                      ],
                    ),
                    
                    const Spacer(),
                    
                    // Continue button
                    AppButton(
                      label: 'Terminer',
                      onPressed: _isFormValid ? _onContinue : null,
                      variant: AppButtonVariant.primary,
                      size: AppButtonSize.large,
                      isFullWidth: true,
                      isDisabled: !_isFormValid,
                    ),
                    
                    AppSpacing.vGapMd,
                  ],
                ),
              ),
            ),
            
            // Numeric keypad
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: AppColors.neutral200,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: SafeArea(
                top: false,
                child: Column(
                  children: [
                    _buildKeypadRow(['1', '2', '3']),
                    _buildKeypadRow(['4', '5', '6']),
                    _buildKeypadRow(['7', '8', '9']),
                    _buildKeypadRow(['', '0', 'back']),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKeypadRow(List<String> keys) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: keys.map((key) => _buildKey(key)).toList(),
      ),
    );
  }

  Widget _buildKey(String key) {
    if (key.isEmpty) {
      return const SizedBox(width: 90, height: 60);
    }

    final isBackspace = key == 'back';

    return Material(
      color: isBackspace ? Colors.transparent : AppColors.white,
      borderRadius: BorderRadius.circular(12),
      elevation: isBackspace ? 0 : 1,
      shadowColor: Colors.black12,
      child: InkWell(
        onTap: () {
          if (isBackspace) {
            _onBackspace();
          } else {
            _onKeyPressed(key);
          }
          HapticFeedback.lightImpact();
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 90,
          height: 60,
          alignment: Alignment.center,
          child: isBackspace
              ? Icon(
                  Icons.backspace_outlined,
                  color: AppColors.textPrimary,
                  size: 26,
                )
              : Text(
                  key,
                  style: AppTypography.headlineMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
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

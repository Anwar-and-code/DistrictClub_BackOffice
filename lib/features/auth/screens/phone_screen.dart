import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _phoneController = TextEditingController();
  bool _acceptedTerms = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onContinue() {
    if (_phoneController.text.isNotEmpty && _acceptedTerms) {
      Navigator.of(context).pushNamed('/auth/otp');
    }
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
              // Logo
              const AppLogo(
                size: AppLogoSize.medium,
              ),
              
              AppSpacing.vGapXxl,
              
              // Phone icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppRadius.borderRadiusLg,
                ),
                child: Icon(
                  Icons.smartphone,
                  size: 40,
                  color: AppColors.brandPrimary,
                ),
              ),
              
              AppSpacing.vGapXl,
              
              // Title
              Text(
                'Entrer votre numéro mobile',
                style: AppTypography.titleLarge,
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
              
              AppSpacing.vGapMd,
              
              // Terms checkbox
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: _acceptedTerms,
                      onChanged: (value) {
                        setState(() {
                          _acceptedTerms = value ?? false;
                        });
                      },
                      activeColor: AppColors.brandPrimary,
                    ),
                  ),
                  AppSpacing.hGapSm,
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _acceptedTerms = !_acceptedTerms;
                        });
                      },
                      child: RichText(
                        text: TextSpan(
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          children: [
                            const TextSpan(
                              text: 'En continuant, vous acceptez nos ',
                            ),
                            TextSpan(
                              text: 'conditions générales d\'utilisation',
                              style: TextStyle(
                                color: AppColors.brandPrimary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              
              const Spacer(),
              
              // Continue button
              AppButton(
                label: 'Suivant',
                onPressed: _phoneController.text.isNotEmpty && _acceptedTerms
                    ? _onContinue
                    : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isDisabled: _phoneController.text.isEmpty || !_acceptedTerms,
              ),
              
              AppSpacing.vGapLg,
            ],
          ),
        ),
      ),
    );
  }
}

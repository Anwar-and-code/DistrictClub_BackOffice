import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import 'otp_screen.dart';

class EmailScreen extends StatefulWidget {
  const EmailScreen({super.key});

  @override
  State<EmailScreen> createState() => _EmailScreenState();
}

class _EmailScreenState extends State<EmailScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool get _isFormValid {
    return _emailController.text.contains('@');
  }

  void _onSubmit() async {
    if (!_isFormValid) return;

    setState(() => _isLoading = true);

    // Send OTP to email - backend will handle account creation if needed
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() => _isLoading = false);
      
      // Navigate to OTP screen with slide transition (hierarchical navigation)
      context.navigateSlide(
        OtpScreen(
          email: _emailController.text,
          isLogin: true,
        ),
        routeName: '/auth/otp',
      );
    }
  }

  void _signInWithGoogle() async {
    // TODO: Implement Google sign-in
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Connexion avec Google en cours...'),
        backgroundColor: AppColors.brandPrimary,
      ),
    );
  }

  void _signInWithMicrosoft() async {
    // TODO: Implement Microsoft sign-in
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Connexion avec Microsoft en cours...'),
        backgroundColor: AppColors.brandPrimary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              AppSpacing.vGapXl,

              // Logo
              Image.asset(
                'assets/images/logo.png',
                height: 40,
                errorBuilder: (_, __, ___) => const AppLogo(
                  size: AppLogoSize.medium,
                ),
              ),

              AppSpacing.vGapXxl,

              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.brandOlive,
                  borderRadius: AppRadius.borderRadiusLg,
                ),
                child: const Icon(
                  Icons.person_outlined,
                  size: 40,
                  color: AppColors.white,
                ),
              ),

              AppSpacing.vGapLg,

              // Title
              Text(
                'Connexion',
                style: AppTypography.titleLarge,
                textAlign: TextAlign.center,
              ),

              AppSpacing.vGapXs,

              // Subtitle
              Text(
                'Connectez-vous pour accéder à votre espace',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),

              AppSpacing.vGapXl,

              // Email field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Email',
                    style: AppTypography.inputLabel,
                  ),
                  AppSpacing.vGapXs,
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (_) => setState(() {}),
                    style: AppTypography.inputText,
                    decoration: InputDecoration(
                      hintText: 'votre@email.com',
                      hintStyle: AppTypography.inputHint,
                      prefixIcon: Padding(
                        padding: const EdgeInsets.only(left: 16, right: 12),
                        child: Icon(
                          Icons.email_outlined,
                          size: 22,
                          color: AppColors.iconSecondary,
                        ),
                      ),
                      prefixIconConstraints: const BoxConstraints(
                        minWidth: 0,
                        minHeight: 0,
                      ),
                      filled: true,
                      fillColor: AppColors.inputBackground,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 20,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(color: AppColors.inputBorder),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(color: AppColors.inputBorder),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(
                          color: AppColors.inputBorderFocus,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              AppSpacing.vGapXl,

              // Submit button
              AppButton(
                label: 'Envoyer le code',
                onPressed: _isFormValid ? _onSubmit : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isLoading: _isLoading,
                isDisabled: !_isFormValid,
              ),

              AppSpacing.vGapLg,

              // Divider with "OU"
              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: AppColors.inputBorder,
                      thickness: 1,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'OU',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: AppColors.inputBorder,
                      thickness: 1,
                    ),
                  ),
                ],
              ),

              AppSpacing.vGapLg,

              // Google sign-in button
              SizedBox(
                height: 56,
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _signInWithGoogle,
                  style: OutlinedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFFFFF),
                    side: BorderSide(color: AppColors.inputBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.inputBorderRadius,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        'assets/images/google_icon.png',
                        width: 20,
                        height: 20,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.g_mobiledata,
                          size: 24,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Continuer avec Google',
                        style: AppTypography.buttonMedium.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              AppSpacing.vGapMd,

              // Microsoft sign-in button
              SizedBox(
                height: 56,
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _signInWithMicrosoft,
                  style: OutlinedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFFFFF),
                    side: BorderSide(color: AppColors.inputBorder),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.inputBorderRadius,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        'assets/images/microsoft_icon.png',
                        width: 20,
                        height: 20,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.window,
                          size: 24,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Continuer avec Microsoft',
                        style: AppTypography.buttonMedium.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              AppSpacing.vGapXxl,
              AppSpacing.vGapXxl,

              // Terms and conditions at the bottom
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    children: [
                      const TextSpan(
                        text: 'En continuant, vous acceptez nos ',
                      ),
                      TextSpan(
                        text: 'conditions générales d\'utilisations',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.brandPrimary,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                      const TextSpan(
                        text: '.',
                      ),
                    ],
                  ),
                ),
              ),

              AppSpacing.vGapXl,
            ],
          ),
        ),
      ),
    );
  }
}


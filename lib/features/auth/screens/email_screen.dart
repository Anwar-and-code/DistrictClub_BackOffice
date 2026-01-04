import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import 'otp_screen.dart';

class EmailScreen extends StatefulWidget {
  const EmailScreen({super.key});

  @override
  State<EmailScreen> createState() => _EmailScreenState();
}

class _EmailScreenState extends State<EmailScreen> {
  final _emailController = TextEditingController();
  bool _isLogin = true;
  bool _acceptedTerms = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool get _isFormValid {
    final hasEmail = _emailController.text.contains('@');
    if (_isLogin) {
      return hasEmail;
    }
    return hasEmail && _acceptedTerms;
  }

  void _onSubmit() async {
    if (!_isFormValid) return;

    setState(() => _isLoading = true);

    // Send OTP to email
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() => _isLoading = false);
      
      // Navigate to OTP screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => OtpScreen(
            email: _emailController.text,
            isLogin: _isLogin,
          ),
        ),
      );
    }
  }

  void _toggleMode() {
    setState(() {
      _isLogin = !_isLogin;
      _acceptedTerms = false;
    });
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
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppRadius.borderRadiusLg,
                ),
                child: Icon(
                  _isLogin ? Icons.login_outlined : Icons.person_add_outlined,
                  size: 40,
                  color: AppColors.brandPrimary,
                ),
              ),

              AppSpacing.vGapLg,

              // Title
              Text(
                _isLogin ? 'Connexion' : 'Créer un compte',
                style: AppTypography.titleLarge,
                textAlign: TextAlign.center,
              ),

              AppSpacing.vGapXs,

              // Subtitle
              Text(
                _isLogin
                    ? 'Connectez-vous pour accéder à votre espace'
                    : 'Inscrivez-vous pour réserver vos terrains',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),

              AppSpacing.vGapXxl,

              // Email field
              AppTextField(
                controller: _emailController,
                label: 'Email',
                hint: 'votre@email.com',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                onChanged: (_) => setState(() {}),
              ),

              AppSpacing.vGapMd,

              if (!_isLogin) ...[
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
                          setState(() => _acceptedTerms = value ?? false);
                        },
                        activeColor: AppColors.brandPrimary,
                      ),
                    ),
                    AppSpacing.hGapSm,
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _acceptedTerms = !_acceptedTerms);
                        },
                        child: RichText(
                          text: TextSpan(
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            children: [
                              const TextSpan(
                                text: "J'accepte les ",
                              ),
                              TextSpan(
                                text: "conditions générales d'utilisation",
                                style: TextStyle(
                                  color: AppColors.brandPrimary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const TextSpan(text: " et la "),
                              TextSpan(
                                text: "politique de confidentialité",
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
              ],

              AppSpacing.vGapXl,

              // Submit button
              AppButton(
                label: _isLogin ? 'Envoyer le code' : "S'inscrire",
                onPressed: _isFormValid ? _onSubmit : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isLoading: _isLoading,
                isDisabled: !_isFormValid,
              ),

              AppSpacing.vGapXl,

              // Toggle login/register
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _isLogin
                        ? "Pas encore de compte ? "
                        : "Déjà un compte ? ",
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  GestureDetector(
                    onTap: _toggleMode,
                    child: Text(
                      _isLogin ? "S'inscrire" : "Se connecter",
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),

              AppSpacing.vGapLg,
            ],
          ),
        ),
      ),
    );
  }
}


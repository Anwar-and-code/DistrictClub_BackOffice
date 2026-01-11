import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import 'register_screen.dart';
import 'onboarding_name_screen.dart';

class OtpScreen extends StatefulWidget {
  final String email;
  final bool isLogin;
  
  const OtpScreen({
    super.key,
    required this.email,
    this.isLogin = true,
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  String _otpCode = '';
  int _resendTimer = 60;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      if (_resendTimer > 0) {
        setState(() => _resendTimer--);
        return true;
      }
      return false;
    });
  }

  void _onKeyPressed(String key) {
    if (_otpCode.length < 4) {
      setState(() => _otpCode += key);
      
      // Auto-verify when complete
      if (_otpCode.length == 4) {
        _verifyCode();
      }
    }
  }

  void _onBackspace() {
    if (_otpCode.isNotEmpty) {
      setState(() => _otpCode = _otpCode.substring(0, _otpCode.length - 1));
    }
  }

  void _verifyCode() async {
    setState(() => _isVerifying = true);
    
    // Simulate verification
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() => _isVerifying = false);
      
      if (widget.isLogin) {
        // Login -> Go to onboarding flow (slide transition)
        context.navigateSlide(
          OnboardingNameScreen(email: widget.email),
          routeName: '/auth/onboarding/name',
        );
      } else {
        // Register -> Go to complete profile (slide transition)
        context.navigateSlide(
          const RegisterScreen(),
          routeName: '/auth/register',
        );
      }
    }
  }

  void _resendCode() {
    if (_resendTimer == 0) {
      setState(() {
        _resendTimer = 60;
        _otpCode = '';
      });
      _startResendTimer();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Code renvoyé par SMS'),
          backgroundColor: AppColors.success,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _receiveCall() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vous allez recevoir un appel'),
        backgroundColor: AppColors.brandPrimary,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Back button
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.only(left: AppSpacing.xs, top: AppSpacing.xs),
                child: IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary,
                    size: 22,
                  ),
                ),
              ),
            ),
            // Top section with logo, title, and OTP boxes
            Expanded(
              flex: 3,
              child: Padding(
                padding: AppSpacing.screenPadding,
                child: Column(
                  children: [
                    // Logo
                    const AppLogo(
                      size: AppLogoSize.large,
                    ),
                    
                    AppSpacing.vGapXxl,
                    
                    // Title
                    Text(
                      'Authentification',
                      style: AppTypography.headlineMedium,
                      textAlign: TextAlign.center,
                    ),
                    
                    AppSpacing.vGapSm,
                    
                    // Email address
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        children: [
                          const TextSpan(text: 'Code envoyé à '),
                          TextSpan(
                            text: widget.email,
                            style: TextStyle(
                              color: AppColors.brandSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    AppSpacing.vGapXxl,
                    
                    // OTP Display Boxes
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(4, (index) {
                        final hasValue = index < _otpCode.length;
                        final value = hasValue ? _otpCode[index] : '';
                        
                        return Container(
                          width: 65,
                          height: 65,
                          margin: EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            color: hasValue 
                                ? AppColors.brandSecondary.withValues(alpha: 0.1)
                                : AppColors.brandOlive.withValues(alpha: 0.08),
                            borderRadius: AppRadius.borderRadiusMd,
                            border: Border.all(
                              color: hasValue 
                                  ? AppColors.brandSecondary
                                  : AppColors.brandOlive.withValues(alpha: 0.3),
                              width: hasValue ? 2 : 1.5,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              value,
                              style: AppTypography.headlineLarge.copyWith(
                                color: AppColors.brandSecondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                    
                    AppSpacing.vGapXl,
                    
                    // Resend options
                    Text(
                      "Vous n'avez pas reçu de code ?",
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    AppSpacing.vGapXs,
                    GestureDetector(
                      onTap: _resendTimer == 0 ? _resendCode : null,
                      child: Text(
                        _resendTimer > 0
                            ? 'Renvoyer (${_resendTimer}s)'
                            : 'Renvoyer',
                        style: AppTypography.bodyMedium.copyWith(
                          color: _resendTimer > 0
                              ? AppColors.textTertiary
                              : AppColors.brandSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    AppSpacing.vGapXs,
                    GestureDetector(
                      onTap: _receiveCall,
                      child: Text(
                        'Recevoir un appel',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.brandSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    
                    AppSpacing.vGapLg,
                    
                    // Loading indicator
                    if (_isVerifying)
                      SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.brandSecondary,
                          ),
                        ),
                      ),
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
        onTap: isBackspace ? _onBackspace : () => _onKeyPressed(key),
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
}

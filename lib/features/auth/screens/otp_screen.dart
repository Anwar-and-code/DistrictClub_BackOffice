import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  String _otpCode = '';
  bool _isResending = false;
  int _resendTimer = 30;

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

  void _onOtpCompleted(String code) {
    setState(() => _otpCode = code);
    if (code.length == 4) {
      // Simulate verification
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          Navigator.of(context).pushNamed('/auth/register');
        }
      });
    }
  }

  void _resendCode() {
    if (_resendTimer == 0) {
      setState(() {
        _isResending = true;
        _resendTimer = 30;
      });
      
      // Simulate resend
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() => _isResending = false);
          _startResendTimer();
        }
      });
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
                color: AppColors.brandPrimary,
              ),
              
              AppSpacing.vGapXxl,
              
              // Title
              Text(
                'Authentification',
                style: AppTypography.titleLarge,
                textAlign: TextAlign.center,
              ),
              
              AppSpacing.vGapSm,
              
              // Subtitle
              Text(
                'Un OTP sera envoyé au +225 07 77 46 56 00',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              
              AppSpacing.vGapSm,
              
              // Change number link
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Text(
                  'Modifier ce numéro',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.brandPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              
              AppSpacing.vGapXxl,
              
              // OTP Input
              AppOtpField(
                length: 4,
                onCompleted: _onOtpCompleted,
                onChanged: (code) => setState(() => _otpCode = code),
              ),
              
              AppSpacing.vGapXl,
              
              // Resend code
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Vous n'avez pas reçu le code ? ",
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  GestureDetector(
                    onTap: _resendTimer == 0 ? _resendCode : null,
                    child: Text(
                      _resendTimer > 0
                          ? 'Renvoyer (${_resendTimer}s)'
                          : 'Renvoyer le code',
                      style: AppTypography.bodySmall.copyWith(
                        color: _resendTimer > 0
                            ? AppColors.textTertiary
                            : AppColors.brandPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              
              const Spacer(),
              
              // Numeric keypad
              _buildNumericKeypad(),
              
              AppSpacing.vGapLg,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNumericKeypad() {
    return Column(
      children: [
        _buildKeypadRow(['1', '2', '3']),
        AppSpacing.vGapMd,
        _buildKeypadRow(['4', '5', '6']),
        AppSpacing.vGapMd,
        _buildKeypadRow(['7', '8', '9']),
        AppSpacing.vGapMd,
        _buildKeypadRow(['', '0', 'back']),
      ],
    );
  }

  Widget _buildKeypadRow(List<String> keys) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: keys.map((key) => _buildKey(key)).toList(),
    );
  }

  Widget _buildKey(String key) {
    if (key.isEmpty) {
      return const SizedBox(width: 72, height: 56);
    }

    final isBackspace = key == 'back';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          // Key handling would go here
        },
        borderRadius: AppRadius.borderRadiusFull,
        child: Container(
          width: 72,
          height: 56,
          alignment: Alignment.center,
          child: isBackspace
              ? Icon(
                  Icons.backspace_outlined,
                  color: AppColors.textPrimary,
                  size: 24,
                )
              : Text(
                  key,
                  style: AppTypography.headlineMedium.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/design_system/design_system.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Navigate after the total animation duration
    Future.delayed(const Duration(milliseconds: 2800), () {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/onboarding');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandPrimary,
      body: RepaintBoundary(
        child: Center(
          child: const AppLogoImage()
              .animate()
              // 1. Entrance: Fade + Scale + Blur
              .fadeIn(duration: 800.ms, curve: Curves.easeOut)
              .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.0, 1.0), duration: 800.ms, curve: Curves.easeOutBack)
              .blur(begin: const Offset(10, 10), end: Offset.zero, duration: 800.ms, curve: Curves.easeOut)
              // 2. Highlight: Shimmer effect
              .shimmer(delay: 500.ms, duration: 1500.ms, color: Colors.white.withValues(alpha: 0.4), size: 2)
              // 3. Exit hint: Subtle pulse before navigation
              .then(delay: 200.ms)
              .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.05, 1.05), duration: 300.ms, curve: Curves.easeInOut)
              .then()
              .scale(begin: const Offset(1.05, 1.05), end: const Offset(1.0, 1.0), duration: 300.ms, curve: Curves.easeInOut),
        ),
      ),
    )
    // Animate background color change from Brand to White/Neutral if desired, 
    // or keep it Brand Primary for strong identity. 
    // Let's do a subtle background fade to make the logo pop more if needed, 
    // but the plan mentioned Brand -> White. Let's strictly follow the plan if possible, 
    // but a full white background might clash if the logo is white text.
    // The previous implementation went to white. Let's assume the logo works on white or changes color.
    // Actually, checking previous code: 'AppLogoImage' handles text fallback.
    // Let's stick to a solid impactful Brand Primary background for the "Professionnal" feel
    // as it usually looks better than fading to white unless the logo inverts.
    // We will stick to the plan's suggestion of "Brand Primary" for now as it's safer/cleaner.
    .animate()
    .custom(
      duration: 800.ms,
      builder: (context, value, child) => Container(
        color: Color.lerp(AppColors.brandPrimary, AppColors.surfaceDefault, value),
        child: child,
      ),
    );
     // Note: The previous code had a complex controller logic. 
     // We simplified it. The background transition in the previous code was:
     // _backgroundColorAnimation = ColorTween(begin: AppColors.brandPrimary, end: AppColors.white)
     // But wait, if we fade to white, the white logo (implied) might be invisible.
     // Let's verify AppLogoImage.
  }
}

/// Logo widget that displays the image logo
/// Place your logo file at: assets/images/logo.png
class AppLogoImage extends StatelessWidget {
  final double? width;
  final double? height;
  
  const AppLogoImage({
    super.key,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: width ?? 200,
      height: height ?? 60,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        // Fallback to text logo if image not found
        return const AppLogo(
          size: AppLogoSize.xlarge,
        );
      },
    );
  }
}


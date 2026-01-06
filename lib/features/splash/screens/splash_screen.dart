import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import '../../onboarding/screens/onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _backgroundAnimation;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2800),
      vsync: this,
    );
    
    // Background transition happens in the last portion of the animation
    _backgroundAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.6, 1.0, curve: Curves.easeInOut),
      ),
    );
    
    _controller.forward();
    
    // Navigate after the total animation duration with phase transition
    Future.delayed(const Duration(milliseconds: 2800), () {
      if (mounted) {
        context.navigatePhase(
          const OnboardingScreen(),
          routeName: '/onboarding',
          replace: true,
        );
      }
    });
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _backgroundAnimation,
      builder: (context, child) {
        final backgroundValue = _backgroundAnimation.value;
        final backgroundColor = Color.lerp(
          AppColors.brandPrimary, 
          AppColors.surfaceDefault, 
          backgroundValue,
        )!;
        
        return Scaffold(
          backgroundColor: backgroundColor,
          body: RepaintBoundary(
            child: Center(
              child: _AnimatedLogo(backgroundProgress: backgroundValue),
            ),
          ),
        );
      },
    );
  }
}

class _AnimatedLogo extends StatelessWidget {
  final double backgroundProgress;
  
  const _AnimatedLogo({required this.backgroundProgress});
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // White logo (visible on brown background, fades out)
        Opacity(
          opacity: 1.0 - backgroundProgress,
          child: Image.asset(
            'assets/images/padelhouse_white.png',
            width: 200,
            height: 60,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return const AppLogo(size: AppLogoSize.xlarge);
            },
          ),
        ),
        // Regular logo (invisible on brown, fades in on light background)
        Opacity(
          opacity: backgroundProgress,
          child: Image.asset(
            'assets/images/logo.png',
            width: 200,
            height: 60,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return const AppLogo(size: AppLogoSize.xlarge);
            },
          ),
        ),
      ],
    )
        .animate()
        // 1. Entrance: Fade + Scale + Blur
        .fadeIn(duration: 800.ms, curve: Curves.easeOut)
        .scale(
          begin: const Offset(0.8, 0.8), 
          end: const Offset(1.0, 1.0), 
          duration: 800.ms, 
          curve: Curves.easeOutBack,
        )
        .blur(
          begin: const Offset(10, 10), 
          end: Offset.zero, 
          duration: 800.ms, 
          curve: Curves.easeOut,
        )
        // 2. Highlight: Shimmer effect
        .shimmer(
          delay: 500.ms, 
          duration: 1500.ms, 
          color: Colors.white.withValues(alpha: 0.4), 
          size: 2,
        )
        // 3. Exit hint: Subtle pulse before navigation
        .then(delay: 200.ms)
        .scale(
          begin: const Offset(1.0, 1.0), 
          end: const Offset(1.05, 1.05), 
          duration: 300.ms, 
          curve: Curves.easeInOut,
        )
        .then()
        .scale(
          begin: const Offset(1.05, 1.05), 
          end: const Offset(1.0, 1.0), 
          duration: 300.ms, 
          curve: Curves.easeInOut,
        );
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


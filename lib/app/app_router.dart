import 'package:flutter/material.dart';
import '../core/router/page_transitions.dart';
import '../features/splash/screens/splash_screen.dart';
import '../features/onboarding/screens/onboarding_screen.dart';
import '../features/auth/screens/email_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/home/screens/replays_screen.dart';
import '../features/home/screens/coaching_screen.dart';
import 'main_shell.dart';

/// Application router with context-aware page transitions
/// 
/// Transition types by navigation semantics:
/// - **Phase transitions** (fade+scale): splash→onboarding→auth→main
/// - **Hierarchical** (slide+fade): navigating deeper into content
/// - **Modal** (slide up): detail views, bottom sheets
/// - **Lateral** (fade through): sibling screens at same level
class AppRouter {
  // Route names
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String authEmail = '/auth/email';
  static const String authRegister = '/auth/register';
  static const String main = '/main';
  static const String replays = '/replays';
  static const String coaching = '/coaching';

  /// Phase transition routes (milestone navigations)
  static const Set<String> _phaseRoutes = {
    splash,
    onboarding,
    authEmail,
    main,
  };

  /// Modal/detail routes (slide up)
  static const Set<String> _modalRoutes = {
    // Add modal routes here as needed
  };

  /// Determines the appropriate transition type based on route semantics
  static PageTransitionType _getTransitionType(String? routeName, String? previousRoute) {
    // Phase transitions for milestone routes
    if (_phaseRoutes.contains(routeName)) {
      // Special case: splash always uses fade (first screen)
      if (routeName == splash) {
        return PageTransitionType.fade;
      }
      return PageTransitionType.phase;
    }
    
    // Modal routes use slide up
    if (_modalRoutes.contains(routeName)) {
      return PageTransitionType.slideUp;
    }
    
    // Default: hierarchical navigation (slide right)
    return PageTransitionType.slideRight;
  }

  /// Generate route with appropriate transition
  static Route<dynamic> generateRoute(RouteSettings settings) {
    final Widget page;
    
    switch (settings.name) {
      case splash:
        page = const SplashScreen();
        break;
      case onboarding:
        page = const OnboardingScreen();
        break;
      case authEmail:
        page = const EmailScreen();
        break;
      case authRegister:
        page = const RegisterScreen();
        break;
      case main:
        page = const MainShell();
        break;
      case replays:
        page = const ReplaysScreen();
        break;
      case coaching:
        page = const CoachingScreen();
        break;
      default:
        page = const SplashScreen();
    }
    
    final transitionType = _getTransitionType(settings.name, null);
    
    return AppPageRoute(
      page: page,
      transitionType: transitionType,
      settings: settings,
    );
  }
  
  /// Create a route with a specific transition type (for programmatic navigation)
  static Route<T> createRoute<T>({
    required Widget page,
    required PageTransitionType transitionType,
    String? routeName,
  }) {
    return AppPageRoute<T>(
      page: page,
      transitionType: transitionType,
      settings: RouteSettings(name: routeName),
    );
  }
}

import 'package:flutter/material.dart';
import '../design_system/design_system.dart';

/// Page transition types for semantic navigation
enum PageTransitionType {
  /// Fade + Scale - For phase/milestone transitions (splash→onboarding→auth→main)
  phase,
  
  /// Slide from right + Fade - For hierarchical/forward navigation
  slideRight,
  
  /// Slide from left + Fade - For backward navigation
  slideLeft,
  
  /// Slide from bottom + Fade - For modal/detail views
  slideUp,
  
  /// Fade through - For lateral/sibling transitions
  fadeThrough,
  
  /// Simple fade - For subtle transitions
  fade,
  
  /// No transition - Instant switch
  none,
}

/// Custom page route with configurable transitions
class AppPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final PageTransitionType transitionType;
  
  AppPageRoute({
    required this.page,
    this.transitionType = PageTransitionType.slideRight,
    super.settings,
  }) : super(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return _buildTransition(
        transitionType,
        animation,
        secondaryAnimation,
        child,
      );
    },
    transitionDuration: _getDuration(transitionType),
    reverseTransitionDuration: _getReverseDuration(transitionType),
  );
  
  static Duration _getDuration(PageTransitionType type) {
    switch (type) {
      case PageTransitionType.phase:
        return AppAnimations.durationSlow; // 400ms
      case PageTransitionType.slideRight:
      case PageTransitionType.slideLeft:
        return AppAnimations.durationMedium; // 300ms
      case PageTransitionType.slideUp:
        return const Duration(milliseconds: 350);
      case PageTransitionType.fadeThrough:
        return AppAnimations.durationMedium; // 300ms
      case PageTransitionType.fade:
        return AppAnimations.durationNormal; // 200ms
      case PageTransitionType.none:
        return Duration.zero;
    }
  }
  
  static Duration _getReverseDuration(PageTransitionType type) {
    switch (type) {
      case PageTransitionType.phase:
        return AppAnimations.durationMedium; // 300ms
      case PageTransitionType.slideRight:
      case PageTransitionType.slideLeft:
        return const Duration(milliseconds: 250);
      case PageTransitionType.slideUp:
        return AppAnimations.durationMedium; // 300ms
      case PageTransitionType.fadeThrough:
        return AppAnimations.durationNormal; // 200ms
      case PageTransitionType.fade:
        return AppAnimations.durationFast; // 150ms
      case PageTransitionType.none:
        return Duration.zero;
    }
  }
  
  static Widget _buildTransition(
    PageTransitionType type,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    switch (type) {
      case PageTransitionType.phase:
        return _PhaseTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          child: child,
        );
      case PageTransitionType.slideRight:
        return _SlideTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          slideFromRight: true,
          child: child,
        );
      case PageTransitionType.slideLeft:
        return _SlideTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          slideFromRight: false,
          child: child,
        );
      case PageTransitionType.slideUp:
        return _SlideUpTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          child: child,
        );
      case PageTransitionType.fadeThrough:
        return _FadeThroughTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          child: child,
        );
      case PageTransitionType.fade:
        return _FadeTransition(
          animation: animation,
          child: child,
        );
      case PageTransitionType.none:
        return child;
    }
  }
}

/// Phase transition: Fade + Scale for milestone transitions
/// Used for: splash→onboarding→auth→main
class _PhaseTransition extends StatelessWidget {
  final Animation<double> animation;
  final Animation<double> secondaryAnimation;
  final Widget child;
  
  const _PhaseTransition({
    required this.animation,
    required this.secondaryAnimation,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    // Entering page: fade in + scale up
    final fadeIn = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    );
    
    final scaleIn = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.0, 1.0, curve: Curves.easeOutCubic),
    );
    
    // Exiting page (secondary): fade out + scale down slightly
    final fadeOut = CurvedAnimation(
      parent: secondaryAnimation,
      curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
    );
    
    final scaleOut = Tween<double>(begin: 1.0, end: 0.92).animate(
      CurvedAnimation(
        parent: secondaryAnimation,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInCubic),
      ),
    );
    
    return FadeTransition(
      opacity: Tween<double>(begin: 0.0, end: 1.0).animate(fadeIn),
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.94, end: 1.0).animate(scaleIn),
        child: FadeTransition(
          opacity: Tween<double>(begin: 1.0, end: 0.0).animate(fadeOut),
          child: ScaleTransition(
            scale: scaleOut,
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Slide transition with fade for hierarchical navigation
class _SlideTransition extends StatelessWidget {
  final Animation<double> animation;
  final Animation<double> secondaryAnimation;
  final bool slideFromRight;
  final Widget child;
  
  const _SlideTransition({
    required this.animation,
    required this.secondaryAnimation,
    required this.slideFromRight,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    // Primary animation: slide + fade in
    final slideAnimation = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    
    final fadeAnimation = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
    );
    
    // Secondary animation: the exiting page slides slightly and fades
    final secondarySlide = CurvedAnimation(
      parent: secondaryAnimation,
      curve: Curves.easeInOutCubic,
    );
    
    final secondaryFade = CurvedAnimation(
      parent: secondaryAnimation,
      curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
    );
    
    final beginOffset = slideFromRight 
        ? const Offset(1.0, 0.0) 
        : const Offset(-1.0, 0.0);
    
    final secondaryOffset = slideFromRight 
        ? const Offset(-0.25, 0.0) 
        : const Offset(0.25, 0.0);
    
    return SlideTransition(
      position: Tween<Offset>(
        begin: beginOffset,
        end: Offset.zero,
      ).animate(slideAnimation),
      child: FadeTransition(
        opacity: Tween<double>(begin: 0.3, end: 1.0).animate(fadeAnimation),
        child: SlideTransition(
          position: Tween<Offset>(
            begin: Offset.zero,
            end: secondaryOffset,
          ).animate(secondarySlide),
          child: FadeTransition(
            opacity: Tween<double>(begin: 1.0, end: 0.7).animate(secondaryFade),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Slide up transition for modals and detail views
class _SlideUpTransition extends StatelessWidget {
  final Animation<double> animation;
  final Animation<double> secondaryAnimation;
  final Widget child;
  
  const _SlideUpTransition({
    required this.animation,
    required this.secondaryAnimation,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    final slideAnimation = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    
    final fadeAnimation = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
    );
    
    final scaleAnimation = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
    );
    
    // Secondary: scale down and fade the background
    final secondaryScale = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(
        parent: secondaryAnimation,
        curve: Curves.easeInOutCubic,
      ),
    );
    
    final secondaryFade = Tween<double>(begin: 1.0, end: 0.5).animate(
      CurvedAnimation(
        parent: secondaryAnimation,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );
    
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.0, 0.15),
        end: Offset.zero,
      ).animate(slideAnimation),
      child: FadeTransition(
        opacity: Tween<double>(begin: 0.0, end: 1.0).animate(fadeAnimation),
        child: ScaleTransition(
          scale: Tween<double>(begin: 0.96, end: 1.0).animate(scaleAnimation),
          child: ScaleTransition(
            scale: secondaryScale,
            child: FadeTransition(
              opacity: secondaryFade,
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

/// Fade through transition for lateral/sibling navigation
/// Material 3 style: outgoing fades out while incoming fades in
class _FadeThroughTransition extends StatelessWidget {
  final Animation<double> animation;
  final Animation<double> secondaryAnimation;
  final Widget child;
  
  const _FadeThroughTransition({
    required this.animation,
    required this.secondaryAnimation,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    // Incoming: fade in with slight scale
    final fadeIn = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
    );
    
    final scaleIn = CurvedAnimation(
      parent: animation,
      curve: const Interval(0.0, 1.0, curve: Curves.easeOutCubic),
    );
    
    // Outgoing: fade out quickly
    final fadeOut = CurvedAnimation(
      parent: secondaryAnimation,
      curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
    );
    
    final scaleOut = Tween<double>(begin: 1.0, end: 0.92).animate(
      CurvedAnimation(
        parent: secondaryAnimation,
        curve: Curves.easeInCubic,
      ),
    );
    
    return FadeTransition(
      opacity: Tween<double>(begin: 0.0, end: 1.0).animate(fadeIn),
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.92, end: 1.0).animate(scaleIn),
        child: FadeTransition(
          opacity: Tween<double>(begin: 1.0, end: 0.0).animate(fadeOut),
          child: ScaleTransition(
            scale: scaleOut,
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Simple fade transition
class _FadeTransition extends StatelessWidget {
  final Animation<double> animation;
  final Widget child;
  
  const _FadeTransition({
    required this.animation,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeOut,
      ),
      child: child,
    );
  }
}

/// Extension for easy navigation with transitions
extension NavigatorTransitionExtension on NavigatorState {
  /// Push with phase transition (for milestone navigations)
  Future<T?> pushPhase<T>(Widget page, {String? routeName}) {
    return push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.phase,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Push replacement with phase transition
  Future<T?> pushReplacementPhase<T>(Widget page, {String? routeName}) {
    return pushReplacement(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.phase,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Push with slide transition (default forward navigation)
  Future<T?> pushSlide<T>(Widget page, {String? routeName}) {
    return push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.slideRight,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Push with slide up transition (for modals/details)
  Future<T?> pushSlideUp<T>(Widget page, {String? routeName}) {
    return push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.slideUp,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Push with fade through transition (for lateral navigation)
  Future<T?> pushFadeThrough<T>(Widget page, {String? routeName}) {
    return push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.fadeThrough,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Push with simple fade
  Future<T?> pushFade<T>(Widget page, {String? routeName}) {
    return push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.fade,
      settings: RouteSettings(name: routeName),
    ));
  }
}

/// Extension for BuildContext navigation
extension ContextNavigationExtension on BuildContext {
  /// Navigate with phase transition (milestone)
  Future<T?> navigatePhase<T>(Widget page, {String? routeName, bool replace = false}) {
    final nav = Navigator.of(this);
    if (replace) {
      return nav.pushReplacement(AppPageRoute<T>(
        page: page,
        transitionType: PageTransitionType.phase,
        settings: RouteSettings(name: routeName),
      ));
    }
    return nav.push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.phase,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Navigate with slide transition (forward)
  Future<T?> navigateSlide<T>(Widget page, {String? routeName, bool replace = false}) {
    final nav = Navigator.of(this);
    if (replace) {
      return nav.pushReplacement(AppPageRoute<T>(
        page: page,
        transitionType: PageTransitionType.slideRight,
        settings: RouteSettings(name: routeName),
      ));
    }
    return nav.push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.slideRight,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Navigate with slide up transition (modal/detail)
  Future<T?> navigateSlideUp<T>(Widget page, {String? routeName}) {
    return Navigator.of(this).push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.slideUp,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Navigate with fade through (lateral)
  Future<T?> navigateFadeThrough<T>(Widget page, {String? routeName, bool replace = false}) {
    final nav = Navigator.of(this);
    if (replace) {
      return nav.pushReplacement(AppPageRoute<T>(
        page: page,
        transitionType: PageTransitionType.fadeThrough,
        settings: RouteSettings(name: routeName),
      ));
    }
    return nav.push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.fadeThrough,
      settings: RouteSettings(name: routeName),
    ));
  }
  
  /// Navigate with simple fade
  Future<T?> navigateFade<T>(Widget page, {String? routeName, bool replace = false}) {
    final nav = Navigator.of(this);
    if (replace) {
      return nav.pushReplacement(AppPageRoute<T>(
        page: page,
        transitionType: PageTransitionType.fade,
        settings: RouteSettings(name: routeName),
      ));
    }
    return nav.push(AppPageRoute<T>(
      page: page,
      transitionType: PageTransitionType.fade,
      settings: RouteSettings(name: routeName),
    ));
  }
}

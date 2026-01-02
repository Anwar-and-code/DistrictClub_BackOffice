import 'package:flutter/material.dart';

/// Design tokens for animations - PadelHouse Design System
/// Based on Material 3 motion system with brand customizations
abstract final class AppAnimations {
  // ==========================================================================
  // DURATION VALUES
  // ==========================================================================
  
  /// 100ms - Micro interactions (icon changes, hover effects)
  static const Duration durationInstant = Duration(milliseconds: 100);
  
  /// 150ms - Quick feedback (button presses, toggles)
  static const Duration durationFast = Duration(milliseconds: 150);
  
  /// 200ms - Standard UI feedback
  static const Duration durationNormal = Duration(milliseconds: 200);
  
  /// 300ms - Medium transitions (expanding/collapsing)
  static const Duration durationMedium = Duration(milliseconds: 300);
  
  /// 400ms - Complex transitions
  static const Duration durationSlow = Duration(milliseconds: 400);
  
  /// 500ms - Large transitions (page transitions)
  static const Duration durationSlower = Duration(milliseconds: 500);
  
  /// 700ms - Emphasis animations
  static const Duration durationEmphasis = Duration(milliseconds: 700);
  
  /// 1000ms - Long animations (splash screens)
  static const Duration durationLong = Duration(milliseconds: 1000);

  // ==========================================================================
  // EASING CURVES
  // ==========================================================================
  
  /// Standard easing - Most UI transitions
  static const Curve curveStandard = Curves.easeInOut;
  
  /// Emphasized easing - Important transitions
  static const Curve curveEmphasized = Curves.easeInOutCubic;
  
  /// Decelerate - Elements entering the screen
  static const Curve curveDecelerate = Curves.decelerate;
  
  /// Accelerate - Elements leaving the screen
  static const Curve curveAccelerate = Curves.easeIn;
  
  /// Linear - Continuous animations (progress bars)
  static const Curve curveLinear = Curves.linear;
  
  /// Bounce - Playful interactions
  static const Curve curveBounce = Curves.bounceOut;
  
  /// Elastic - Spring-like feel
  static const Curve curveElastic = Curves.elasticOut;
  
  /// Fast out, slow in - Standard Material curve
  static const Curve curveFastOutSlowIn = Curves.fastOutSlowIn;
  
  /// Overshoot - Exaggerated arrival
  static const Curve curveOvershoot = Curves.easeOutBack;

  // ==========================================================================
  // SEMANTIC ANIMATION TOKENS
  // ==========================================================================
  
  // --- Button Animations ---
  static const Duration buttonPressDuration = durationFast;
  static const Curve buttonPressCurve = curveStandard;
  
  // --- Card Animations ---
  static const Duration cardHoverDuration = durationNormal;
  static const Curve cardHoverCurve = curveStandard;
  
  // --- Page Transitions ---
  static const Duration pageTransitionDuration = durationMedium;
  static const Curve pageTransitionCurve = curveFastOutSlowIn;
  
  // --- Modal Animations ---
  static const Duration modalEnterDuration = durationMedium;
  static const Duration modalExitDuration = durationNormal;
  static const Curve modalEnterCurve = curveDecelerate;
  static const Curve modalExitCurve = curveAccelerate;
  
  // --- List Item Animations ---
  static const Duration listItemDuration = durationNormal;
  static const Curve listItemCurve = curveDecelerate;
  
  // --- Navigation Animations ---
  static const Duration navBarDuration = durationNormal;
  static const Curve navBarCurve = curveStandard;
  
  // --- Fade Animations ---
  static const Duration fadeInDuration = durationNormal;
  static const Duration fadeOutDuration = durationFast;
  static const Curve fadeCurve = curveStandard;
  
  // --- Scale Animations ---
  static const Duration scaleInDuration = durationNormal;
  static const Curve scaleCurve = curveEmphasized;
  
  // --- Slide Animations ---
  static const Duration slideInDuration = durationMedium;
  static const Curve slideInCurve = curveDecelerate;
  static const Curve slideOutCurve = curveAccelerate;
  
  // --- Splash Screen Animation ---
  static const Duration splashLogoDuration = durationLong;
  static const Duration splashFadeInDuration = durationSlower;
  static const Curve splashCurve = curveEmphasized;

  // ==========================================================================
  // STAGGER DELAYS (for sequential animations)
  // ==========================================================================
  
  /// Delay between sequential list items
  static const Duration staggerDelay = Duration(milliseconds: 50);
  
  /// Delay for grid items
  static const Duration staggerDelayGrid = Duration(milliseconds: 30);
  
  /// Delay for fast sequences
  static const Duration staggerDelayFast = Duration(milliseconds: 25);

  // ==========================================================================
  // ANIMATION HELPERS
  // ==========================================================================
  
  /// Creates a staggered delay based on index
  static Duration getStaggerDelay(int index, {Duration delay = staggerDelay}) {
    return delay * index;
  }
  
  /// Standard animation configuration for implicit animations
  static const animatedContainerConfig = (
    duration: durationNormal,
    curve: curveStandard,
  );
  
  /// Page transition builder for custom page routes
  static Widget fadeTransitionBuilder(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: animation,
      child: child,
    );
  }
  
  /// Slide up transition builder
  static Widget slideUpTransitionBuilder(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final tween = Tween(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).chain(CurveTween(curve: curveDecelerate));
    
    return SlideTransition(
      position: animation.drive(tween),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }
}

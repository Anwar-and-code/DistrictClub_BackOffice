import 'package:flutter/material.dart';

/// Design tokens for border radius - PadelHouse Design System
/// Based on Material 3 shape system with brand customizations
abstract final class AppRadius {
  // ==========================================================================
  // RADIUS VALUES (Primitive tokens)
  // ==========================================================================
  
  /// No radius - Sharp corners
  static const double none = 0.0;
  
  /// 4px - Extra small radius
  static const double xs = 4.0;
  
  /// 8px - Small radius
  static const double sm = 8.0;
  
  /// 12px - Medium radius
  static const double md = 12.0;
  
  /// 16px - Large radius
  static const double lg = 16.0;
  
  /// 20px - Extra large radius
  static const double xl = 20.0;
  
  /// 24px - Extra extra large radius
  static const double xxl = 24.0;
  
  /// 32px - Huge radius
  static const double huge = 32.0;
  
  /// Full circle (use with square containers)
  static const double full = 9999.0;

  // ==========================================================================
  // SEMANTIC RADIUS TOKENS
  // ==========================================================================
  
  /// Default radius for most components
  static const double componentDefault = md;
  
  /// Radius for buttons
  static const double button = sm;
  
  /// Radius for cards
  static const double card = lg;
  
  /// Radius for input fields
  static const double input = sm;
  
  /// Radius for chips and badges
  static const double chip = full;
  
  /// Radius for modals and bottom sheets
  static const double modal = xxl;
  
  /// Radius for images and media
  static const double image = md;
  
  /// Radius for avatars
  static const double avatar = full;
  
  /// Radius for navigation bar items
  static const double navItem = sm;

  // ==========================================================================
  // BORDER RADIUS HELPERS
  // ==========================================================================
  
  // --- All Corners ---
  static const BorderRadius borderRadiusNone = BorderRadius.zero;
  static const BorderRadius borderRadiusXs = BorderRadius.all(Radius.circular(xs));
  static const BorderRadius borderRadiusSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius borderRadiusMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius borderRadiusLg = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius borderRadiusXl = BorderRadius.all(Radius.circular(xl));
  static const BorderRadius borderRadiusXxl = BorderRadius.all(Radius.circular(xxl));
  static const BorderRadius borderRadiusFull = BorderRadius.all(Radius.circular(full));
  
  // --- Component-Specific ---
  static const BorderRadius buttonBorderRadius = BorderRadius.all(Radius.circular(button));
  static const BorderRadius cardBorderRadius = BorderRadius.all(Radius.circular(card));
  static const BorderRadius inputBorderRadius = BorderRadius.all(Radius.circular(input));
  static const BorderRadius chipBorderRadius = BorderRadius.all(Radius.circular(chip));
  static const BorderRadius modalBorderRadius = BorderRadius.all(Radius.circular(modal));
  static const BorderRadius avatarBorderRadius = BorderRadius.all(Radius.circular(avatar));
  
  // --- Top Only (for bottom sheets, modals) ---
  static const BorderRadius topMd = BorderRadius.only(
    topLeft: Radius.circular(md),
    topRight: Radius.circular(md),
  );
  
  static const BorderRadius topLg = BorderRadius.only(
    topLeft: Radius.circular(lg),
    topRight: Radius.circular(lg),
  );
  
  static const BorderRadius topXl = BorderRadius.only(
    topLeft: Radius.circular(xl),
    topRight: Radius.circular(xl),
  );
  
  static const BorderRadius topXxl = BorderRadius.only(
    topLeft: Radius.circular(xxl),
    topRight: Radius.circular(xxl),
  );
  
  // --- Bottom Only ---
  static const BorderRadius bottomMd = BorderRadius.only(
    bottomLeft: Radius.circular(md),
    bottomRight: Radius.circular(md),
  );
  
  static const BorderRadius bottomLg = BorderRadius.only(
    bottomLeft: Radius.circular(lg),
    bottomRight: Radius.circular(lg),
  );

  // ==========================================================================
  // ROUNDED RECTANGLE BORDER HELPERS
  // ==========================================================================
  
  static RoundedRectangleBorder roundedBorderNone = const RoundedRectangleBorder();
  
  static RoundedRectangleBorder roundedBorderSm = RoundedRectangleBorder(
    borderRadius: borderRadiusSm,
  );
  
  static RoundedRectangleBorder roundedBorderMd = RoundedRectangleBorder(
    borderRadius: borderRadiusMd,
  );
  
  static RoundedRectangleBorder roundedBorderLg = RoundedRectangleBorder(
    borderRadius: borderRadiusLg,
  );
  
  static RoundedRectangleBorder roundedBorderXl = RoundedRectangleBorder(
    borderRadius: borderRadiusXl,
  );
}

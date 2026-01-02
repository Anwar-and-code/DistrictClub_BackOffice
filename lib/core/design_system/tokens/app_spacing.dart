import 'package:flutter/material.dart';

/// Design tokens for spacing - PadelHouse Design System
/// Based on a 4px base unit with a harmonic scale
/// 
/// Usage:
/// - Use semantic tokens (e.g., `AppSpacing.sm`) for consistent spacing
/// - Padding helpers are provided for common use cases
abstract final class AppSpacing {
  // ==========================================================================
  // BASE UNIT
  // ==========================================================================
  
  /// Base spacing unit (4px)
  static const double unit = 4.0;

  // ==========================================================================
  // SPACING SCALE (Primitive tokens)
  // ==========================================================================
  
  /// 0px - No spacing
  static const double none = 0.0;
  
  /// 2px - Hairline spacing
  static const double xxxs = unit * 0.5;  // 2px
  
  /// 4px - Extra extra small
  static const double xxs = unit;          // 4px
  
  /// 8px - Extra small
  static const double xs = unit * 2;       // 8px
  
  /// 12px - Small
  static const double sm = unit * 3;       // 12px
  
  /// 16px - Medium (Default)
  static const double md = unit * 4;       // 16px
  
  /// 20px - Medium large
  static const double ml = unit * 5;       // 20px
  
  /// 24px - Large
  static const double lg = unit * 6;       // 24px
  
  /// 32px - Extra large
  static const double xl = unit * 8;       // 32px
  
  /// 40px - Extra extra large
  static const double xxl = unit * 10;     // 40px
  
  /// 48px - Extra extra extra large
  static const double xxxl = unit * 12;    // 48px
  
  /// 64px - Huge
  static const double huge = unit * 16;    // 64px
  
  /// 80px - Massive
  static const double massive = unit * 20; // 80px

  // ==========================================================================
  // SEMANTIC SPACING TOKENS
  // ==========================================================================
  
  // --- Component Internal Spacing ---
  static const double componentPaddingXs = xs;    // 8px
  static const double componentPaddingSm = sm;    // 12px
  static const double componentPaddingMd = md;    // 16px
  static const double componentPaddingLg = lg;    // 24px
  
  // --- Section Spacing ---
  static const double sectionSpacingSm = lg;      // 24px
  static const double sectionSpacingMd = xl;      // 32px
  static const double sectionSpacingLg = xxxl;    // 48px
  
  // --- Screen Padding ---
  static const double screenPaddingHorizontal = md;  // 16px
  static const double screenPaddingVertical = lg;    // 24px
  static const double screenPaddingTop = xxl;        // 40px
  
  // --- List Spacing ---
  static const double listItemSpacing = sm;       // 12px
  static const double listSectionSpacing = lg;    // 24px
  
  // --- Card Spacing ---
  static const double cardPadding = md;           // 16px
  static const double cardPaddingLarge = lg;      // 24px
  static const double cardSpacing = sm;           // 12px
  
  // --- Input Spacing ---
  static const double inputPaddingHorizontal = md;  // 16px
  static const double inputPaddingVertical = sm;    // 12px
  static const double inputSpacing = xs;            // 8px
  
  // --- Button Spacing ---
  static const double buttonPaddingHorizontal = lg;   // 24px
  static const double buttonPaddingVertical = sm;     // 12px
  static const double buttonSpacing = sm;             // 12px
  
  // --- Icon Spacing ---
  static const double iconSpacing = xs;           // 8px
  static const double iconSpacingLarge = sm;      // 12px

  // ==========================================================================
  // EDGE INSETS HELPERS
  // ==========================================================================
  
  // --- All Sides ---
  static const EdgeInsets paddingNone = EdgeInsets.zero;
  static const EdgeInsets paddingXxs = EdgeInsets.all(xxs);
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);
  
  // --- Horizontal Only ---
  static const EdgeInsets paddingHorizontalXs = EdgeInsets.symmetric(horizontal: xs);
  static const EdgeInsets paddingHorizontalSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets paddingHorizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets paddingHorizontalLg = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets paddingHorizontalXl = EdgeInsets.symmetric(horizontal: xl);
  
  // --- Vertical Only ---
  static const EdgeInsets paddingVerticalXs = EdgeInsets.symmetric(vertical: xs);
  static const EdgeInsets paddingVerticalSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets paddingVerticalMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets paddingVerticalLg = EdgeInsets.symmetric(vertical: lg);
  static const EdgeInsets paddingVerticalXl = EdgeInsets.symmetric(vertical: xl);
  
  // --- Screen Padding ---
  static const EdgeInsets screenPadding = EdgeInsets.symmetric(
    horizontal: screenPaddingHorizontal,
    vertical: screenPaddingVertical,
  );
  
  static const EdgeInsets screenPaddingHorizontalOnly = EdgeInsets.symmetric(
    horizontal: screenPaddingHorizontal,
  );
  
  // --- Card Padding ---
  static const EdgeInsets cardPaddingAll = EdgeInsets.all(cardPadding);
  static const EdgeInsets cardPaddingLargeAll = EdgeInsets.all(cardPaddingLarge);
  
  // --- Input Padding ---
  static const EdgeInsets inputPadding = EdgeInsets.symmetric(
    horizontal: inputPaddingHorizontal,
    vertical: inputPaddingVertical,
  );
  
  // --- Button Padding ---
  static const EdgeInsets buttonPadding = EdgeInsets.symmetric(
    horizontal: buttonPaddingHorizontal,
    vertical: buttonPaddingVertical,
  );

  // ==========================================================================
  // GAP HELPERS (for use with Column/Row)
  // ==========================================================================
  
  static const SizedBox gapNone = SizedBox.shrink();
  static const SizedBox gapXxs = SizedBox(width: xxs, height: xxs);
  static const SizedBox gapXs = SizedBox(width: xs, height: xs);
  static const SizedBox gapSm = SizedBox(width: sm, height: sm);
  static const SizedBox gapMd = SizedBox(width: md, height: md);
  static const SizedBox gapLg = SizedBox(width: lg, height: lg);
  static const SizedBox gapXl = SizedBox(width: xl, height: xl);
  static const SizedBox gapXxl = SizedBox(width: xxl, height: xxl);
  
  // --- Horizontal Gaps ---
  static const SizedBox hGapXxs = SizedBox(width: xxs);
  static const SizedBox hGapXs = SizedBox(width: xs);
  static const SizedBox hGapSm = SizedBox(width: sm);
  static const SizedBox hGapMd = SizedBox(width: md);
  static const SizedBox hGapLg = SizedBox(width: lg);
  static const SizedBox hGapXl = SizedBox(width: xl);
  
  // --- Vertical Gaps ---
  static const SizedBox vGapXxs = SizedBox(height: xxs);
  static const SizedBox vGapXs = SizedBox(height: xs);
  static const SizedBox vGapSm = SizedBox(height: sm);
  static const SizedBox vGapMd = SizedBox(height: md);
  static const SizedBox vGapLg = SizedBox(height: lg);
  static const SizedBox vGapXl = SizedBox(height: xl);
  static const SizedBox vGapXxl = SizedBox(height: xxl);
  static const SizedBox vGapXxxl = SizedBox(height: xxxl);
}

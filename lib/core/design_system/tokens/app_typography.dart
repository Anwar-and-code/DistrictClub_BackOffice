import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Design tokens for typography - PadelHouse Design System
/// Based on Material 3 type scale with brand customizations
/// 
/// Font family: Uses system fonts by default, can be replaced with custom fonts
/// Scale: Follows Material 3 type scale ratios
abstract final class AppTypography {
  // ==========================================================================
  // FONT FAMILIES
  // ==========================================================================
  
  /// Primary font family for body text
  static const String fontFamilyPrimary = 'SF Pro Display';
  
  /// Secondary font family for headings (can be customized)
  static const String fontFamilySecondary = 'SF Pro Display';
  
  /// Monospace font family for code/numbers
  static const String fontFamilyMono = 'SF Mono';

  // ==========================================================================
  // FONT WEIGHTS
  // ==========================================================================
  
  static const FontWeight weightThin = FontWeight.w100;
  static const FontWeight weightExtraLight = FontWeight.w200;
  static const FontWeight weightLight = FontWeight.w300;
  static const FontWeight weightRegular = FontWeight.w400;
  static const FontWeight weightMedium = FontWeight.w500;
  static const FontWeight weightSemiBold = FontWeight.w600;
  static const FontWeight weightBold = FontWeight.w700;
  static const FontWeight weightExtraBold = FontWeight.w800;
  static const FontWeight weightBlack = FontWeight.w900;

  // ==========================================================================
  // FONT SIZES (Primitive tokens)
  // ==========================================================================
  
  static const double fontSize10 = 10.0;
  static const double fontSize11 = 11.0;
  static const double fontSize12 = 12.0;
  static const double fontSize13 = 13.0;
  static const double fontSize14 = 14.0;
  static const double fontSize16 = 16.0;
  static const double fontSize18 = 18.0;
  static const double fontSize20 = 20.0;
  static const double fontSize22 = 22.0;
  static const double fontSize24 = 24.0;
  static const double fontSize28 = 28.0;
  static const double fontSize32 = 32.0;
  static const double fontSize36 = 36.0;
  static const double fontSize40 = 40.0;
  static const double fontSize48 = 48.0;
  static const double fontSize56 = 56.0;
  static const double fontSize64 = 64.0;

  // ==========================================================================
  // LINE HEIGHTS
  // ==========================================================================
  
  static const double lineHeightTight = 1.1;
  static const double lineHeightSnug = 1.25;
  static const double lineHeightNormal = 1.4;
  static const double lineHeightRelaxed = 1.5;
  static const double lineHeightLoose = 1.75;

  // ==========================================================================
  // LETTER SPACING
  // ==========================================================================
  
  static const double letterSpacingTight = -0.5;
  static const double letterSpacingNormal = 0.0;
  static const double letterSpacingWide = 0.5;
  static const double letterSpacingWider = 1.0;

  // ==========================================================================
  // TEXT STYLES - DISPLAY (Hero text, splash screens)
  // ==========================================================================
  
  static const TextStyle displayLarge = TextStyle(
    fontSize: fontSize56,
    fontWeight: weightBold,
    height: lineHeightTight,
    letterSpacing: letterSpacingTight,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle displayMedium = TextStyle(
    fontSize: fontSize48,
    fontWeight: weightBold,
    height: lineHeightTight,
    letterSpacing: letterSpacingTight,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle displaySmall = TextStyle(
    fontSize: fontSize36,
    fontWeight: weightBold,
    height: lineHeightSnug,
    letterSpacing: letterSpacingTight,
    color: AppColors.textPrimary,
  );

  // ==========================================================================
  // TEXT STYLES - HEADLINE (Page titles, section headers)
  // ==========================================================================
  
  static const TextStyle headlineLarge = TextStyle(
    fontSize: fontSize32,
    fontWeight: weightBold,
    height: lineHeightSnug,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle headlineMedium = TextStyle(
    fontSize: fontSize28,
    fontWeight: weightSemiBold,
    height: lineHeightSnug,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle headlineSmall = TextStyle(
    fontSize: fontSize24,
    fontWeight: weightSemiBold,
    height: lineHeightSnug,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );

  // ==========================================================================
  // TEXT STYLES - TITLE (Card titles, list headers)
  // ==========================================================================
  
  static const TextStyle titleLarge = TextStyle(
    fontSize: fontSize22,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle titleMedium = TextStyle(
    fontSize: fontSize18,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle titleSmall = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );

  // ==========================================================================
  // TEXT STYLES - BODY (Main content text)
  // ==========================================================================
  
  static const TextStyle bodyLarge = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightRegular,
    height: lineHeightRelaxed,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: fontSize14,
    fontWeight: weightRegular,
    height: lineHeightRelaxed,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: fontSize12,
    fontWeight: weightRegular,
    height: lineHeightRelaxed,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textSecondary,
  );

  // ==========================================================================
  // TEXT STYLES - LABEL (Buttons, form labels, navigation)
  // ==========================================================================
  
  static const TextStyle labelLarge = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle labelMedium = TextStyle(
    fontSize: fontSize14,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle labelSmall = TextStyle(
    fontSize: fontSize12,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
    color: AppColors.textSecondary,
  );

  // ==========================================================================
  // TEXT STYLES - CAPTION & OVERLINE
  // ==========================================================================
  
  static const TextStyle caption = TextStyle(
    fontSize: fontSize11,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textTertiary,
  );
  
  static const TextStyle overline = TextStyle(
    fontSize: fontSize10,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWider,
    color: AppColors.textSecondary,
  );

  // ==========================================================================
  // COMPONENT-SPECIFIC TEXT STYLES
  // ==========================================================================
  
  // --- Button Text ---
  static const TextStyle buttonLarge = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
  );
  
  static const TextStyle buttonMedium = TextStyle(
    fontSize: fontSize14,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
  );
  
  static const TextStyle buttonSmall = TextStyle(
    fontSize: fontSize12,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
  );
  
  // --- Input Text ---
  static const TextStyle inputText = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle inputLabel = TextStyle(
    fontSize: fontSize14,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.textSecondary,
  );
  
  static const TextStyle inputHint = TextStyle(
    fontSize: fontSize16,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.inputPlaceholder,
  );
  
  static const TextStyle inputError = TextStyle(
    fontSize: fontSize12,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
    color: AppColors.error,
  );
  
  // --- Navigation Text ---
  static const TextStyle navLabel = TextStyle(
    fontSize: fontSize12,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    letterSpacing: letterSpacingNormal,
  );
  
  // --- Badge Text ---
  static const TextStyle badge = TextStyle(
    fontSize: fontSize11,
    fontWeight: weightSemiBold,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
  );
  
  // --- App Bar Title (Brand logo style) ---
  static const TextStyle appBarTitle = TextStyle(
    fontSize: fontSize24,
    fontWeight: weightLight,
    height: lineHeightNormal,
    letterSpacing: letterSpacingWide,
    color: AppColors.brandPrimary,
  );

  // ==========================================================================
  // HELPER METHOD - Get TextTheme for Material Theme
  // ==========================================================================
  
  static TextTheme get textTheme => const TextTheme(
    displayLarge: displayLarge,
    displayMedium: displayMedium,
    displaySmall: displaySmall,
    headlineLarge: headlineLarge,
    headlineMedium: headlineMedium,
    headlineSmall: headlineSmall,
    titleLarge: titleLarge,
    titleMedium: titleMedium,
    titleSmall: titleSmall,
    bodyLarge: bodyLarge,
    bodyMedium: bodyMedium,
    bodySmall: bodySmall,
    labelLarge: labelLarge,
    labelMedium: labelMedium,
    labelSmall: labelSmall,
  );
}

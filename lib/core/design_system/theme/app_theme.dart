import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../tokens/tokens.dart';

/// PadelHouse App Theme
/// 
/// Provides Material 3 compliant ThemeData configurations
/// based on the design system tokens.
class AppTheme {
  AppTheme._();

  // ==========================================================================
  // COLOR SCHEMES
  // ==========================================================================

  /// Light mode color scheme
  static ColorScheme get lightColorScheme => ColorScheme(
    brightness: Brightness.light,
    // Primary
    primary: AppColors.brandPrimary,
    onPrimary: AppColors.white,
    primaryContainer: AppColors.brown100,
    onPrimaryContainer: AppColors.brown900,
    // Secondary
    secondary: AppColors.brandSecondary,
    onSecondary: AppColors.white,
    secondaryContainer: AppColors.gold100,
    onSecondaryContainer: AppColors.gold900,
    // Tertiary
    tertiary: AppColors.brandTertiary,
    onTertiary: AppColors.brown900,
    tertiaryContainer: AppColors.brown50,
    onTertiaryContainer: AppColors.brown800,
    // Error
    error: AppColors.error,
    onError: AppColors.white,
    errorContainer: AppColors.errorLight,
    onErrorContainer: AppColors.error,
    // Surface
    surface: AppColors.surfaceDefault,
    onSurface: AppColors.textPrimary,
    surfaceContainerHighest: AppColors.neutral200,
    onSurfaceVariant: AppColors.textSecondary,
    // Outline
    outline: AppColors.borderDefault,
    outlineVariant: AppColors.borderSubtle,
    // Shadow & Scrim
    shadow: AppColors.cardShadow,
    scrim: AppColors.black,
    // Inverse
    inverseSurface: AppColors.brown900,
    onInverseSurface: AppColors.neutral50,
    inversePrimary: AppColors.gold300,
  );

  /// Dark mode color scheme (for future use)
  static ColorScheme get darkColorScheme => ColorScheme(
    brightness: Brightness.dark,
    // Primary
    primary: AppColors.gold400,
    onPrimary: AppColors.brown900,
    primaryContainer: AppColors.brown700,
    onPrimaryContainer: AppColors.gold100,
    // Secondary
    secondary: AppColors.gold300,
    onSecondary: AppColors.brown900,
    secondaryContainer: AppColors.gold700,
    onSecondaryContainer: AppColors.gold100,
    // Tertiary
    tertiary: AppColors.brown300,
    onTertiary: AppColors.brown900,
    tertiaryContainer: AppColors.brown700,
    onTertiaryContainer: AppColors.brown100,
    // Error
    error: Color(0xFFFFB4AB),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFDAD6),
    // Surface
    surface: AppColors.brown900,
    onSurface: AppColors.neutral100,
    surfaceContainerHighest: AppColors.brown700,
    onSurfaceVariant: AppColors.neutral400,
    // Outline
    outline: AppColors.neutral600,
    outlineVariant: AppColors.neutral700,
    // Shadow & Scrim
    shadow: AppColors.black,
    scrim: AppColors.black,
    // Inverse
    inverseSurface: AppColors.neutral100,
    onInverseSurface: AppColors.brown800,
    inversePrimary: AppColors.brown600,
  );

  // ==========================================================================
  // THEME DATA
  // ==========================================================================

  /// Light theme configuration
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: lightColorScheme,
    brightness: Brightness.light,
    
    // Scaffold
    scaffoldBackgroundColor: AppColors.backgroundPrimary,
    
    // Typography
    textTheme: AppTypography.textTheme,
    fontFamily: AppTypography.fontFamilyPrimary,
    
    // AppBar
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: AppColors.backgroundPrimary,
      foregroundColor: AppColors.textPrimary,
      surfaceTintColor: Colors.transparent,
      centerTitle: true,
      titleTextStyle: AppTypography.appBarTitle,
      iconTheme: IconThemeData(
        color: AppColors.iconPrimary,
        size: AppIcons.appBarIcon,
      ),
      systemOverlayStyle: SystemUiOverlayStyle.dark,
    ),
    
    // Bottom Navigation Bar
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: AppColors.navBarBackground,
      selectedItemColor: AppColors.navBarItemActive,
      unselectedItemColor: AppColors.navBarItemInactive,
      type: BottomNavigationBarType.fixed,
      elevation: AppShadows.elevationMd,
      selectedLabelStyle: AppTypography.navLabel.copyWith(
        color: AppColors.navBarItemActive,
      ),
      unselectedLabelStyle: AppTypography.navLabel.copyWith(
        color: AppColors.navBarItemInactive,
      ),
      showSelectedLabels: true,
      showUnselectedLabels: true,
    ),
    
    // Navigation Bar (Material 3)
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.navBarBackground,
      indicatorColor: AppColors.navBarItemActiveBackground,
      surfaceTintColor: Colors.transparent,
      elevation: AppShadows.elevationMd,
      height: 80,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppTypography.navLabel.copyWith(
            color: AppColors.navBarItemActive,
            fontWeight: FontWeight.w600,
          );
        }
        return AppTypography.navLabel.copyWith(
          color: AppColors.navBarItemInactive,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return IconThemeData(
            color: AppColors.navBarItemActive,
            size: AppIcons.navBarIcon,
          );
        }
        return IconThemeData(
          color: AppColors.navBarItemInactive,
          size: AppIcons.navBarIcon,
        );
      }),
    ),
    
    // Cards
    cardTheme: CardThemeData(
      elevation: AppShadows.elevationSm,
      color: AppColors.cardBackground,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.cardBorderRadius,
      ),
      margin: EdgeInsets.zero,
    ),
    
    // Elevated Button
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.buttonPrimaryBackground,
        foregroundColor: AppColors.buttonPrimaryForeground,
        disabledBackgroundColor: AppColors.buttonDisabledBackground,
        disabledForegroundColor: AppColors.buttonDisabledForeground,
        elevation: AppShadows.elevationSm,
        shadowColor: AppColors.brandPrimary.withOpacity(0.3),
        padding: AppSpacing.buttonPadding,
        minimumSize: const Size(88, 48),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.buttonBorderRadius,
        ),
        textStyle: AppTypography.buttonMedium,
      ),
    ),
    
    // Filled Button
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.buttonPrimaryBackground,
        foregroundColor: AppColors.buttonPrimaryForeground,
        disabledBackgroundColor: AppColors.buttonDisabledBackground,
        disabledForegroundColor: AppColors.buttonDisabledForeground,
        padding: AppSpacing.buttonPadding,
        minimumSize: const Size(88, 48),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.buttonBorderRadius,
        ),
        textStyle: AppTypography.buttonMedium,
      ),
    ),
    
    // Outlined Button
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.brandPrimary,
        disabledForegroundColor: AppColors.buttonDisabledForeground,
        padding: AppSpacing.buttonPadding,
        minimumSize: const Size(88, 48),
        side: BorderSide(color: AppColors.brandPrimary, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.buttonBorderRadius,
        ),
        textStyle: AppTypography.buttonMedium,
      ),
    ),
    
    // Text Button
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.brandPrimary,
        disabledForegroundColor: AppColors.buttonDisabledForeground,
        padding: AppSpacing.buttonPadding,
        minimumSize: const Size(88, 48),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.buttonBorderRadius,
        ),
        textStyle: AppTypography.buttonMedium,
      ),
    ),
    
    // Input Decoration
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.inputBackground,
      contentPadding: AppSpacing.inputPadding,
      border: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.inputBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.inputBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.inputBorderFocus, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.inputBorderError),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.inputBorderError, width: 2),
      ),
      disabledBorder: OutlineInputBorder(
        borderRadius: AppRadius.inputBorderRadius,
        borderSide: BorderSide(color: AppColors.borderSubtle),
      ),
      labelStyle: AppTypography.inputLabel,
      hintStyle: AppTypography.inputHint,
      errorStyle: AppTypography.inputError,
      prefixIconColor: AppColors.iconSecondary,
      suffixIconColor: AppColors.iconSecondary,
    ),
    
    // Floating Action Button
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.brandPrimary,
      foregroundColor: AppColors.white,
      elevation: AppShadows.elevationMd,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderRadiusLg,
      ),
    ),
    
    // Chip
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.surfaceSubtle,
      selectedColor: AppColors.brandPrimary,
      disabledColor: AppColors.neutral200,
      labelStyle: AppTypography.labelSmall,
      padding: AppSpacing.paddingHorizontalSm,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.chipBorderRadius,
      ),
    ),
    
    // Divider
    dividerTheme: DividerThemeData(
      color: AppColors.borderSubtle,
      thickness: 1,
      space: AppSpacing.md,
    ),
    
    // Dialog
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surfaceDefault,
      surfaceTintColor: Colors.transparent,
      elevation: AppShadows.elevationLg,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.modalBorderRadius,
      ),
      titleTextStyle: AppTypography.titleLarge,
      contentTextStyle: AppTypography.bodyMedium,
    ),
    
    // Bottom Sheet
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: AppColors.surfaceDefault,
      surfaceTintColor: Colors.transparent,
      elevation: AppShadows.elevationLg,
      modalBackgroundColor: AppColors.surfaceDefault,
      modalElevation: AppShadows.elevationLg,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.topXxl,
      ),
    ),
    
    // Snackbar
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.brown800,
      contentTextStyle: AppTypography.bodyMedium.copyWith(
        color: AppColors.white,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderRadiusMd,
      ),
      behavior: SnackBarBehavior.floating,
    ),
    
    // ListTile
    listTileTheme: ListTileThemeData(
      contentPadding: AppSpacing.paddingHorizontalMd,
      minVerticalPadding: AppSpacing.sm,
      iconColor: AppColors.iconSecondary,
      textColor: AppColors.textPrimary,
      titleTextStyle: AppTypography.titleSmall,
      subtitleTextStyle: AppTypography.bodySmall,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderRadiusMd,
      ),
    ),
    
    // Icon
    iconTheme: IconThemeData(
      color: AppColors.iconPrimary,
      size: AppIcons.sizeDefault,
    ),
    
    // Progress Indicator
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: AppColors.brandPrimary,
      linearTrackColor: AppColors.neutral200,
      circularTrackColor: AppColors.neutral200,
    ),
    
    // Switch
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.white;
        }
        return AppColors.neutral400;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.brandPrimary;
        }
        return AppColors.neutral200;
      }),
    ),
    
    // Checkbox
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.brandPrimary;
        }
        return Colors.transparent;
      }),
      checkColor: WidgetStateProperty.all(AppColors.white),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderRadiusXs,
      ),
      side: BorderSide(color: AppColors.borderStrong, width: 2),
    ),
    
    // Radio
    radioTheme: RadioThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.brandPrimary;
        }
        return AppColors.borderStrong;
      }),
    ),
    
    // Tab Bar
    tabBarTheme: TabBarThemeData(
      labelColor: AppColors.brandPrimary,
      unselectedLabelColor: AppColors.textSecondary,
      labelStyle: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.w600),
      unselectedLabelStyle: AppTypography.labelMedium,
      indicator: UnderlineTabIndicator(
        borderSide: BorderSide(color: AppColors.brandPrimary, width: 2),
      ),
      indicatorSize: TabBarIndicatorSize.label,
    ),
    
    // Tooltip
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: AppColors.brown800,
        borderRadius: AppRadius.borderRadiusSm,
      ),
      textStyle: AppTypography.bodySmall.copyWith(color: AppColors.white),
      padding: AppSpacing.paddingSm,
    ),
    
    // Page Transitions
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    ),
    
    // Visual Density
    visualDensity: VisualDensity.adaptivePlatformDensity,
    
    // Splash
    splashColor: AppColors.brandPrimary.withOpacity(0.1),
    highlightColor: AppColors.brandPrimary.withOpacity(0.05),
  );

  /// Dark theme configuration
  static ThemeData get darkTheme => lightTheme.copyWith(
    colorScheme: darkColorScheme,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.brown900,
    appBarTheme: lightTheme.appBarTheme.copyWith(
      backgroundColor: AppColors.brown900,
      foregroundColor: AppColors.neutral100,
      systemOverlayStyle: SystemUiOverlayStyle.light,
    ),
  );
}

import 'package:flutter/material.dart';

/// Design tokens for colors - PadelHouse Design System
/// Based on Material 3 color roles and the brand identity
/// 
/// Color palette extracted from brand guidelines:
/// - Primary: Olive/Brown tones (brand identity)
/// - Secondary: Golden/Amber accents
/// - Neutral: Warm grays and whites
abstract final class AppColors {
  // ==========================================================================
  // BRAND COLORS (Seed colors for Material 3)
  // ==========================================================================
  
  /// Primary brand color - Marron #965A26
  static const Color brandPrimary = Color(0xFF965A26);
  
  /// Secondary brand color - Golden Amber
  static const Color brandSecondary = Color(0xFFC4945A);
  
  /// Tertiary brand color - Warm Beige
  static const Color brandTertiary = Color(0xFFD4C4A8);

  /// Brand Olive - The green color we have
  static const Color brandOlive = Color(0xFF6D672B);

  // ==========================================================================
  // PRIMITIVE COLORS (Raw color values)
  // ==========================================================================
  
  // --- Browns (unified marron palette based on #965A26) ---
  static const Color brown50 = Color(0xFFFDF7F2);
  static const Color brown100 = Color(0xFFF9EDE0);
  static const Color brown200 = Color(0xFFEBD1B8);
  static const Color brown300 = Color(0xFFD4A877);
  static const Color brown400 = Color(0xFFB87F4D);
  static const Color brown500 = Color(0xFF965A26);
  static const Color brown600 = Color(0xFF7D4B1F);
  static const Color brown700 = Color(0xFF965A26);
  static const Color brown800 = Color(0xFF6B3F1A);
  static const Color brown900 = Color(0xFF4A2B12);
  
  // --- Golds ---
  static const Color gold50 = Color(0xFFFFF8E7);
  static const Color gold100 = Color(0xFFFFECC4);
  static const Color gold200 = Color(0xFFFFDFA0);
  static const Color gold300 = Color(0xFFFFD27C);
  static const Color gold400 = Color(0xFFF5BC52);
  static const Color gold500 = Color(0xFFC4945A);
  static const Color gold600 = Color(0xFFA67B3D);
  static const Color gold700 = Color(0xFF8A6530);
  static const Color gold800 = Color(0xFF6E5026);
  static const Color gold900 = Color(0xFF523C1C);
  
  // --- Neutrals (Warm) ---
  static const Color neutral50 = Color(0xFFFCFAF8);
  static const Color neutral100 = Color(0xFFF7F4F0);
  static const Color neutral200 = Color(0xFFEDE8E1);
  static const Color neutral300 = Color(0xFFDED6CB);
  static const Color neutral400 = Color(0xFFC5BAA9);
  static const Color neutral500 = Color(0xFFA89B88);
  static const Color neutral600 = Color(0xFF8B7D6A);
  static const Color neutral700 = Color(0xFF6E614F);
  static const Color neutral800 = Color(0xFF524839);
  static const Color neutral900 = Color(0xFF352F25);
  
  // --- Pure Colors ---
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  // --- Semantic Colors ---
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFFE8F5E9);
  static const Color warning = Color(0xFFFF9800);
  static const Color warningLight = Color(0xFFFFF3E0);
  static const Color error = Color(0xFFE53935);
  static const Color errorLight = Color(0xFFFFEBEE);
  static const Color info = Color(0xFF2196F3);
  static const Color infoLight = Color(0xFFE3F2FD);

  // ==========================================================================
  // SEMANTIC TOKENS (Role-based colors)
  // ==========================================================================
  
  // --- Background Colors ---
  static const Color backgroundPrimary = Color(0xFFFFF9F3);
  static const Color backgroundSecondary = neutral50;
  static const Color backgroundTertiary = neutral100;
  static const Color backgroundElevated = white;
  
  // --- Surface Colors ---
  static const Color surfaceDefault = white;
  static const Color surfaceSubtle = neutral50;
  static const Color surfaceMuted = neutral100;
  static const Color surfaceHighlight = gold50;
  
  // --- Text Colors ---
  static const Color textPrimary = Color(0xFF1A1714);
  static const Color textSecondary = Color(0xFF5C5549);
  static const Color textTertiary = Color(0xFF8B8279);
  static const Color textDisabled = Color(0xFFB8AFA3);
  static const Color textOnPrimary = white;
  static const Color textOnSecondary = Color(0xFF1A1714);
  static const Color textLink = brandPrimary;
  
  // --- Border Colors ---
  static const Color borderDefault = neutral200;
  static const Color borderSubtle = neutral100;
  static const Color borderStrong = neutral400;
  static const Color borderFocus = brandPrimary;
  
  // --- Icon Colors ---
  static const Color iconPrimary = Color(0xFF1A1714);
  static const Color iconSecondary = Color(0xFF5C5549);
  static const Color iconTertiary = Color(0xFF8B8279);
  static const Color iconDisabled = Color(0xFFB8AFA3);
  static const Color iconOnPrimary = white;

  // ==========================================================================
  // COMPONENT-SPECIFIC TOKENS
  // ==========================================================================
  
  // --- Button Colors ---
  static const Color buttonPrimaryBackground = brandPrimary;
  static const Color buttonPrimaryForeground = white;
  static const Color buttonSecondaryBackground = neutral100;
  static const Color buttonSecondaryForeground = brandPrimary;
  static const Color buttonTertiaryBackground = Colors.transparent;
  static const Color buttonTertiaryForeground = brandPrimary;
  static const Color buttonDisabledBackground = neutral200;
  static const Color buttonDisabledForeground = neutral500;
  
  // --- Card Colors ---
  static const Color cardBackground = white;
  static const Color cardBorder = neutral200;
  static const Color cardShadow = Color(0x1A000000);
  
  // --- Input Colors ---
  static const Color inputBackground = white;
  static const Color inputBorder = neutral300;
  static const Color inputBorderFocus = brandPrimary;
  static const Color inputBorderError = error;
  static const Color inputPlaceholder = neutral500;
  
  // --- Navigation Colors ---
  static const Color navBarBackground = white;
  static const Color navBarItemActive = brandPrimary;
  static const Color navBarItemInactive = neutral500;
  static const Color navBarItemActiveBackground = gold50;
  
  // --- Modern 2025 Tokens ---
  static const Color glassSurface = Color(0x99FFFFFF); // 60% opacity white
  static const Color glassBorder = Color(0x33FFFFFF); // 20% opacity white
  static const Color neonAccent = Color(0xFF00FF9D); // Cyberpunk Green/Cyan for pop
  static const Color neonGlow = Color(0x6600FF9D); // Glow effect
  
  // --- Reservation Card Colors (from screenshots) ---
  static const Color reservationTimeBadge = brandPrimary;
  static const Color reservationTimeBadgeText = white;
  static const Color reservationCardBorder = Color(0xFFE8E0D4);

  // ==========================================================================
  // GRADIENT DEFINITIONS
  // ==========================================================================
  
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [brandPrimary, brown800],
  );
  
  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [gold400, brandSecondary],
  );
  
  static const LinearGradient surfaceGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [neutral50, white],
  );
}

import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Design tokens for shadows/elevation - PadelHouse Design System
/// Based on Material 3 elevation system with brand customizations
abstract final class AppShadows {
  // ==========================================================================
  // SHADOW COLORS
  // ==========================================================================
  
  static const Color shadowColor = AppColors.cardShadow;
  static const Color shadowColorDark = Color(0x33000000);
  static const Color shadowColorLight = Color(0x0D000000);

  // ==========================================================================
  // ELEVATION VALUES
  // ==========================================================================
  
  /// No elevation
  static const double elevationNone = 0.0;
  
  /// Level 1 - Subtle elevation (cards at rest)
  static const double elevationXs = 1.0;
  
  /// Level 2 - Low elevation (cards, buttons)
  static const double elevationSm = 2.0;
  
  /// Level 3 - Medium elevation (navigation, app bars)
  static const double elevationMd = 4.0;
  
  /// Level 4 - High elevation (modals, dialogs)
  static const double elevationLg = 8.0;
  
  /// Level 5 - Maximum elevation (floating elements)
  static const double elevationXl = 16.0;

  // ==========================================================================
  // BOX SHADOWS (Custom shadows for more control)
  // ==========================================================================
  
  /// No shadow
  static const List<BoxShadow> shadowNone = [];
  
  /// Extra small shadow - Very subtle
  static const List<BoxShadow> shadowXs = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];
  
  /// Small shadow - Cards at rest
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
    BoxShadow(
      color: Color(0x05000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];
  
  /// Medium shadow - Elevated cards, buttons
  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x0F000000),
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];
  
  /// Large shadow - Modals, dropdowns
  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 6,
      offset: Offset(0, 3),
    ),
  ];
  
  /// Extra large shadow - Floating elements
  static const List<BoxShadow> shadowXl = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 24,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];

  // ==========================================================================
  // COMPONENT-SPECIFIC SHADOWS
  // ==========================================================================
  
  /// Card shadow - Default card elevation
  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 8,
      offset: Offset(0, 2),
      spreadRadius: 0,
    ),
  ];
  
  /// Card shadow on hover/focus
  static const List<BoxShadow> cardShadowHover = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 12,
      offset: Offset(0, 4),
      spreadRadius: 0,
    ),
  ];
  
  /// Button shadow
  static const List<BoxShadow> buttonShadow = [
    BoxShadow(
      color: Color(0x1A5C4D3C),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];
  
  /// Navigation bar shadow
  static const List<BoxShadow> navBarShadow = [
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 8,
      offset: Offset(0, -2),
    ),
  ];
  
  /// Bottom sheet shadow
  static const List<BoxShadow> bottomSheetShadow = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 16,
      offset: Offset(0, -4),
    ),
  ];
  
  /// Input focus shadow
  static List<BoxShadow> inputFocusShadow = [
    BoxShadow(
      color: AppColors.brandPrimary.withOpacity(0.15),
      blurRadius: 4,
      offset: Offset.zero,
      spreadRadius: 2,
    ),
  ];
  
  /// Image/banner shadow
  static const List<BoxShadow> imageShadow = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];

  // ==========================================================================
  // INNER SHADOWS (for pressed states)
  // ==========================================================================
  
  static const List<BoxShadow> innerShadowSm = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 2,
      offset: Offset(0, 1),
      spreadRadius: -1,
    ),
  ];
}

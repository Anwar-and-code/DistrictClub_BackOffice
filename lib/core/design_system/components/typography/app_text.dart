import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';

/// PadelHouse Design System - Text Component
/// 
/// Semantic text components for consistent typography usage.
/// 
/// Usage:
/// ```dart
/// AppText.headlineLarge('Title')
/// AppText.bodyMedium('Content')
/// ```
class AppText extends StatelessWidget {
  const AppText(
    this.text, {
    super.key,
    this.style,
    this.color,
    this.maxLines,
    this.overflow,
    this.textAlign,
  });

  final String text;
  final TextStyle? style;
  final Color? color;
  final int? maxLines;
  final TextOverflow? overflow;
  final TextAlign? textAlign;

  // Display styles
  factory AppText.displayLarge(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.displayLarge, color: color, textAlign: textAlign);
  
  factory AppText.displayMedium(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.displayMedium, color: color, textAlign: textAlign);
  
  factory AppText.displaySmall(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.displaySmall, color: color, textAlign: textAlign);

  // Headline styles
  factory AppText.headlineLarge(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.headlineLarge, color: color, textAlign: textAlign, maxLines: maxLines);
  
  factory AppText.headlineMedium(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.headlineMedium, color: color, textAlign: textAlign, maxLines: maxLines);
  
  factory AppText.headlineSmall(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.headlineSmall, color: color, textAlign: textAlign, maxLines: maxLines);

  // Title styles
  factory AppText.titleLarge(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.titleLarge, color: color, textAlign: textAlign, maxLines: maxLines);
  
  factory AppText.titleMedium(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.titleMedium, color: color, textAlign: textAlign, maxLines: maxLines);
  
  factory AppText.titleSmall(String text, {Color? color, TextAlign? textAlign, int? maxLines}) =>
      AppText(text, style: AppTypography.titleSmall, color: color, textAlign: textAlign, maxLines: maxLines);

  // Body styles
  factory AppText.bodyLarge(String text, {Color? color, TextAlign? textAlign, int? maxLines, TextOverflow? overflow}) =>
      AppText(text, style: AppTypography.bodyLarge, color: color, textAlign: textAlign, maxLines: maxLines, overflow: overflow);
  
  factory AppText.bodyMedium(String text, {Color? color, TextAlign? textAlign, int? maxLines, TextOverflow? overflow}) =>
      AppText(text, style: AppTypography.bodyMedium, color: color, textAlign: textAlign, maxLines: maxLines, overflow: overflow);
  
  factory AppText.bodySmall(String text, {Color? color, TextAlign? textAlign, int? maxLines, TextOverflow? overflow}) =>
      AppText(text, style: AppTypography.bodySmall, color: color, textAlign: textAlign, maxLines: maxLines, overflow: overflow);

  // Label styles
  factory AppText.labelLarge(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.labelLarge, color: color, textAlign: textAlign);
  
  factory AppText.labelMedium(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.labelMedium, color: color, textAlign: textAlign);
  
  factory AppText.labelSmall(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.labelSmall, color: color, textAlign: textAlign);

  // Caption & Overline
  factory AppText.caption(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.caption, color: color, textAlign: textAlign);
  
  factory AppText.overline(String text, {Color? color, TextAlign? textAlign}) =>
      AppText(text, style: AppTypography.overline, color: color, textAlign: textAlign);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: (style ?? AppTypography.bodyMedium).copyWith(
        color: color,
      ),
      maxLines: maxLines,
      overflow: overflow ?? (maxLines != null ? TextOverflow.ellipsis : null),
      textAlign: textAlign,
    );
  }
}

/// Section Header - Title with optional action
class AppSectionHeader extends StatelessWidget {
  const AppSectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onActionTap,
    this.padding,
  });

  final String title;
  final String? action;
  final VoidCallback? onActionTap;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? EdgeInsets.zero,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          if (action != null)
            GestureDetector(
              onTap: onActionTap,
              child: Text(
                action!,
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.brandPrimary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Date Header - For grouping items by date
class AppDateHeader extends StatelessWidget {
  const AppDateHeader({
    super.key,
    required this.date,
    this.padding,
  });

  final String date;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Text(
        date,
        style: AppTypography.labelSmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

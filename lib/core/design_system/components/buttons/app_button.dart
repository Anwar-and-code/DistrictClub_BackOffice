import 'package:flutter/material.dart';
import '../../tokens/tokens.dart';

/// Button size variants
enum AppButtonSize { small, medium, large }

/// Button style variants
enum AppButtonVariant { primary, secondary, outline, ghost }

/// PadelHouse Design System - Primary Button Component
/// 
/// A customizable button component following the design system guidelines.
/// 
/// Usage:
/// ```dart
/// AppButton(
///   label: 'Commencer',
///   onPressed: () {},
///   variant: AppButtonVariant.primary,
///   size: AppButtonSize.large,
/// )
/// ```
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.icon,
    this.iconPosition = IconPosition.leading,
    this.isLoading = false,
    this.isFullWidth = false,
    this.isDisabled = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final IconData? icon;
  final IconPosition iconPosition;
  final bool isLoading;
  final bool isFullWidth;
  final bool isDisabled;

  @override
  Widget build(BuildContext context) {
    final isEnabled = !isDisabled && !isLoading && onPressed != null;
    
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: _getHeight(),
      child: _buildButton(context, isEnabled),
    );
  }

  Widget _buildButton(BuildContext context, bool isEnabled) {
    final buttonStyle = _getButtonStyle(isEnabled);
    final child = _buildButtonContent();

    switch (variant) {
      case AppButtonVariant.primary:
        return FilledButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: child,
        );
      case AppButtonVariant.secondary:
        return FilledButton.tonal(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: child,
        );
      case AppButtonVariant.outline:
        return OutlinedButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: child,
        );
      case AppButtonVariant.ghost:
        return TextButton(
          onPressed: isEnabled ? onPressed : null,
          style: buttonStyle,
          child: child,
        );
    }
  }

  Widget _buildButtonContent() {
    if (isLoading) {
      return SizedBox(
        width: _getIconSize(),
        height: _getIconSize(),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            variant == AppButtonVariant.primary
                ? AppColors.white
                : AppColors.brandPrimary,
          ),
        ),
      );
    }

    if (icon == null) {
      return Text(label, style: _getTextStyle());
    }

    final iconWidget = Icon(icon, size: _getIconSize());
    final textWidget = Text(label, style: _getTextStyle());
    final spacing = SizedBox(width: AppSpacing.xs);

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: iconPosition == IconPosition.leading
          ? [iconWidget, spacing, textWidget]
          : [textWidget, spacing, iconWidget],
    );
  }

  double _getHeight() {
    switch (size) {
      case AppButtonSize.small:
        return 36;
      case AppButtonSize.medium:
        return 48;
      case AppButtonSize.large:
        return 56;
    }
  }

  double _getIconSize() {
    switch (size) {
      case AppButtonSize.small:
        return 16;
      case AppButtonSize.medium:
        return 20;
      case AppButtonSize.large:
        return 24;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case AppButtonSize.small:
        return AppTypography.buttonSmall;
      case AppButtonSize.medium:
        return AppTypography.buttonMedium;
      case AppButtonSize.large:
        return AppTypography.buttonLarge;
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case AppButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case AppButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 12);
      case AppButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 16);
    }
  }

  ButtonStyle _getButtonStyle(bool isEnabled) {
    final padding = _getPadding();
    
    switch (variant) {
      case AppButtonVariant.primary:
        return FilledButton.styleFrom(
          backgroundColor: isEnabled 
              ? AppColors.buttonPrimaryBackground 
              : AppColors.buttonDisabledBackground,
          foregroundColor: isEnabled 
              ? AppColors.buttonPrimaryForeground 
              : AppColors.buttonDisabledForeground,
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.buttonBorderRadius,
          ),
        );
      case AppButtonVariant.secondary:
        return FilledButton.styleFrom(
          backgroundColor: isEnabled 
              ? AppColors.buttonSecondaryBackground 
              : AppColors.buttonDisabledBackground,
          foregroundColor: isEnabled 
              ? AppColors.buttonSecondaryForeground 
              : AppColors.buttonDisabledForeground,
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.buttonBorderRadius,
          ),
        );
      case AppButtonVariant.outline:
        return OutlinedButton.styleFrom(
          foregroundColor: isEnabled 
              ? AppColors.brandPrimary 
              : AppColors.buttonDisabledForeground,
          padding: padding,
          side: BorderSide(
            color: isEnabled 
                ? AppColors.brandPrimary 
                : AppColors.buttonDisabledBackground,
            width: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.buttonBorderRadius,
          ),
        );
      case AppButtonVariant.ghost:
        return TextButton.styleFrom(
          foregroundColor: isEnabled 
              ? AppColors.brandPrimary 
              : AppColors.buttonDisabledForeground,
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.buttonBorderRadius,
          ),
        );
    }
  }
}

/// Icon position in button
enum IconPosition { leading, trailing }

/// Icon-only button variant
class AppIconButton extends StatelessWidget {
  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.variant = AppButtonVariant.ghost,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.isDisabled = false,
    this.tooltip,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final bool isDisabled;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final isEnabled = !isDisabled && !isLoading && onPressed != null;
    final buttonSize = _getSize();
    final iconSize = _getIconSize();

    Widget button = Container(
      width: buttonSize,
      height: buttonSize,
      decoration: _getDecoration(isEnabled),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onPressed : null,
          borderRadius: AppRadius.borderRadiusFull,
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: iconSize,
                    height: iconSize,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getForegroundColor(isEnabled),
                      ),
                    ),
                  )
                : Icon(
                    icon,
                    size: iconSize,
                    color: _getForegroundColor(isEnabled),
                  ),
          ),
        ),
      ),
    );

    if (tooltip != null) {
      button = Tooltip(
        message: tooltip!,
        child: button,
      );
    }

    return button;
  }

  double _getSize() {
    switch (size) {
      case AppButtonSize.small:
        return 32;
      case AppButtonSize.medium:
        return 40;
      case AppButtonSize.large:
        return 48;
    }
  }

  double _getIconSize() {
    switch (size) {
      case AppButtonSize.small:
        return 16;
      case AppButtonSize.medium:
        return 20;
      case AppButtonSize.large:
        return 24;
    }
  }

  BoxDecoration _getDecoration(bool isEnabled) {
    switch (variant) {
      case AppButtonVariant.primary:
        return BoxDecoration(
          color: isEnabled 
              ? AppColors.buttonPrimaryBackground 
              : AppColors.buttonDisabledBackground,
          shape: BoxShape.circle,
        );
      case AppButtonVariant.secondary:
        return BoxDecoration(
          color: isEnabled 
              ? AppColors.buttonSecondaryBackground 
              : AppColors.buttonDisabledBackground,
          shape: BoxShape.circle,
        );
      case AppButtonVariant.outline:
        return BoxDecoration(
          color: Colors.transparent,
          shape: BoxShape.circle,
          border: Border.all(
            color: isEnabled 
                ? AppColors.brandPrimary 
                : AppColors.buttonDisabledBackground,
            width: 1.5,
          ),
        );
      case AppButtonVariant.ghost:
        return const BoxDecoration(
          color: Colors.transparent,
          shape: BoxShape.circle,
        );
    }
  }

  Color _getForegroundColor(bool isEnabled) {
    if (!isEnabled) return AppColors.buttonDisabledForeground;
    
    switch (variant) {
      case AppButtonVariant.primary:
        return AppColors.buttonPrimaryForeground;
      case AppButtonVariant.secondary:
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return AppColors.brandPrimary;
    }
  }
}

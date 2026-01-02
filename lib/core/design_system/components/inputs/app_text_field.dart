import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/tokens.dart';

/// PadelHouse Design System - Text Field Component
/// 
/// A customizable text field component following the design system guidelines.
/// Based on the registration/inscription screens from the mockups.
/// 
/// Usage:
/// ```dart
/// AppTextField(
///   label: 'Numéro mobile',
///   hint: '+225 07 77 46 56 00',
///   prefixIcon: Icons.phone,
/// )
/// ```
class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.keyboardType,
    this.textInputAction,
    this.maxLines = 1,
    this.maxLength,
    this.inputFormatters,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.validator,
    this.focusNode,
    this.textCapitalization = TextCapitalization.none,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final int maxLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final String? Function(String?)? validator;
  final FocusNode? focusNode;
  final TextCapitalization textCapitalization;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: AppTypography.inputLabel,
          ),
          AppSpacing.vGapXs,
        ],
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          obscureText: widget.obscureText,
          enabled: widget.enabled,
          readOnly: widget.readOnly,
          autofocus: widget.autofocus,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          maxLines: widget.maxLines,
          maxLength: widget.maxLength,
          inputFormatters: widget.inputFormatters,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          onTap: widget.onTap,
          validator: widget.validator,
          textCapitalization: widget.textCapitalization,
          style: AppTypography.inputText,
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: AppTypography.inputHint,
            prefixIcon: widget.prefixIcon != null
                ? Icon(
                    widget.prefixIcon,
                    size: AppIcons.inputIcon,
                    color: _isFocused
                        ? AppColors.brandPrimary
                        : AppColors.iconSecondary,
                  )
                : null,
            suffixIcon: widget.suffixIcon != null
                ? IconButton(
                    icon: Icon(
                      widget.suffixIcon,
                      size: AppIcons.inputIcon,
                      color: _isFocused
                          ? AppColors.brandPrimary
                          : AppColors.iconSecondary,
                    ),
                    onPressed: widget.onSuffixTap,
                  )
                : null,
            errorText: null, // We handle error display ourselves
            counterText: '',
            filled: true,
            fillColor: widget.enabled
                ? AppColors.inputBackground
                : AppColors.surfaceSubtle,
            contentPadding: AppSpacing.inputPadding,
            border: OutlineInputBorder(
              borderRadius: AppRadius.inputBorderRadius,
              borderSide: BorderSide(color: AppColors.inputBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: AppRadius.inputBorderRadius,
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.inputBorder,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: AppRadius.inputBorderRadius,
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.inputBorderFocus,
                width: 2,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: AppRadius.inputBorderRadius,
              borderSide: BorderSide(color: AppColors.borderSubtle),
            ),
          ),
        ),
        if (widget.errorText != null || widget.helperText != null) ...[
          AppSpacing.vGapXxs,
          Text(
            widget.errorText ?? widget.helperText!,
            style: widget.errorText != null
                ? AppTypography.inputError
                : AppTypography.caption,
          ),
        ],
      ],
    );
  }
}

/// Phone Number Input - Specialized for phone number entry
/// Based on the registration screen mockup
class AppPhoneField extends StatelessWidget {
  const AppPhoneField({
    super.key,
    this.controller,
    this.label,
    this.hint = '+225 07 77 46 56 00',
    this.countryCode = '+225',
    this.errorText,
    this.onChanged,
    this.enabled = true,
  });

  final TextEditingController? controller;
  final String? label;
  final String hint;
  final String countryCode;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(label!, style: AppTypography.inputLabel),
          AppSpacing.vGapXs,
        ],
        Container(
          decoration: BoxDecoration(
            borderRadius: AppRadius.inputBorderRadius,
            border: Border.all(
              color: errorText != null 
                  ? AppColors.error 
                  : AppColors.inputBorder,
            ),
            color: AppColors.inputBackground,
          ),
          child: Row(
            children: [
              // Country code selector
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  border: Border(
                    right: BorderSide(color: AppColors.inputBorder),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Flag placeholder
                    Container(
                      width: 24,
                      height: 16,
                      decoration: BoxDecoration(
                        color: AppColors.neutral200,
                        borderRadius: AppRadius.borderRadiusXs,
                      ),
                    ),
                    AppSpacing.hGapXs,
                    Text(
                      countryCode,
                      style: AppTypography.bodyMedium,
                    ),
                    AppSpacing.hGapXxs,
                    Icon(
                      AppIcons.arrowDown,
                      size: AppIcons.sizeXs,
                      color: AppColors.iconSecondary,
                    ),
                  ],
                ),
              ),
              // Phone input
              Expanded(
                child: TextField(
                  controller: controller,
                  enabled: enabled,
                  keyboardType: TextInputType.phone,
                  style: AppTypography.inputText,
                  onChanged: onChanged,
                  decoration: InputDecoration(
                    hintText: hint.replaceFirst(countryCode, '').trim(),
                    hintStyle: AppTypography.inputHint,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (errorText != null) ...[
          AppSpacing.vGapXxs,
          Text(errorText!, style: AppTypography.inputError),
        ],
      ],
    );
  }
}

/// OTP Input - For verification code entry
/// Based on the authentication screen mockup
class AppOtpField extends StatefulWidget {
  const AppOtpField({
    super.key,
    this.length = 4,
    this.onCompleted,
    this.onChanged,
    this.errorText,
  });

  final int length;
  final ValueChanged<String>? onCompleted;
  final ValueChanged<String>? onChanged;
  final String? errorText;

  @override
  State<AppOtpField> createState() => _AppOtpFieldState();
}

class _AppOtpFieldState extends State<AppOtpField> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
      (index) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
      (index) => FocusNode(),
    );
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onChanged(int index, String value) {
    if (value.length == 1 && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    
    final otp = _controllers.map((c) => c.text).join();
    widget.onChanged?.call(otp);
    
    if (otp.length == widget.length) {
      widget.onCompleted?.call(otp);
    }
  }

  void _onKeyDown(int index, RawKeyEvent event) {
    if (event is RawKeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _controllers[index].text.isEmpty &&
        index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.length,
            (index) => Padding(
              padding: EdgeInsets.symmetric(horizontal: AppSpacing.xs),
              child: SizedBox(
                width: 56,
                height: 64,
                child: RawKeyboardListener(
                  focusNode: FocusNode(),
                  onKey: (event) => _onKeyDown(index, event),
                  child: TextField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    style: AppTypography.headlineMedium,
                    onChanged: (value) => _onChanged(index, value),
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: AppColors.inputBackground,
                      border: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(
                          color: widget.errorText != null
                              ? AppColors.error
                              : AppColors.inputBorder,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(
                          color: widget.errorText != null
                              ? AppColors.error
                              : AppColors.inputBorder,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: AppRadius.inputBorderRadius,
                        borderSide: BorderSide(
                          color: widget.errorText != null
                              ? AppColors.error
                              : AppColors.inputBorderFocus,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        if (widget.errorText != null) ...[
          AppSpacing.vGapSm,
          Text(
            widget.errorText!,
            style: AppTypography.inputError,
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}

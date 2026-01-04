import 'package:flutter/material.dart';

enum AppLogoSize { small, medium, large, xlarge }

/// PadelHouse Logo Widget
/// Renders the brand logo from assets
class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.size = AppLogoSize.medium,
    this.color,
  });

  final AppLogoSize size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: _getWidth(),
      height: _getHeight(),
      fit: BoxFit.contain,
      color: color, // Applies color filter if provided (e.g. for monochrome usage)
    );
  }

  double _getWidth() {
    switch (size) {
      case AppLogoSize.small:
        return 80;
      case AppLogoSize.medium:
        return 120;
      case AppLogoSize.large:
        return 160;
      case AppLogoSize.xlarge:
        return 200;
    }
  }

  double _getHeight() {
    switch (size) {
      case AppLogoSize.small:
        return 24;
      case AppLogoSize.medium:
        return 32;
      case AppLogoSize.large:
        return 48;
      case AppLogoSize.xlarge:
        return 60;
    }
  }
}

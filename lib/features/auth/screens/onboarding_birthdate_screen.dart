import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';
import 'onboarding_phone_screen.dart';

/// Données des signes astrologiques avec leurs phrases padel
class ZodiacSign {
  final String name;
  final String emoji;
  final String phrase;
  final int startMonth;
  final int startDay;
  final int endMonth;
  final int endDay;

  const ZodiacSign({
    required this.name,
    required this.emoji,
    required this.phrase,
    required this.startMonth,
    required this.startDay,
    required this.endMonth,
    required this.endDay,
  });
}

const List<ZodiacSign> _zodiacSigns = [
  ZodiacSign(
    name: 'Bélier',
    emoji: '♈',
    phrase: 'Un Bélier sur le terrain ? Attention aux smashs de feu ! 🔥',
    startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
  ),
  ZodiacSign(
    name: 'Taureau',
    emoji: '♉',
    phrase: 'Un Taureau dans l\'arène, solide comme un roc en défense ! 🪨',
    startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
  ),
  ZodiacSign(
    name: 'Gémeaux',
    emoji: '♊',
    phrase: 'Un Gémeaux dans l\'arène, ça va chauffer en double ! 🔥',
    startMonth: 5, startDay: 21, endMonth: 6, endDay: 20,
  ),
  ZodiacSign(
    name: 'Cancer',
    emoji: '♋',
    phrase: 'Un Cancer sur le court ? Intuition et lobs parfaits ! 🌙',
    startMonth: 6, startDay: 21, endMonth: 7, endDay: 22,
  ),
  ZodiacSign(
    name: 'Lion',
    emoji: '♌',
    phrase: 'Un Lion entre en piste ! Le roi du padel est arrivé ! 👑',
    startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
  ),
  ZodiacSign(
    name: 'Vierge',
    emoji: '♍',
    phrase: 'Une Vierge au padel ? Technique parfaite, zéro erreur ! ✨',
    startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
  ),
  ZodiacSign(
    name: 'Balance',
    emoji: '♎',
    phrase: 'Une Balance sur le terrain ! L\'équilibre parfait en double ! ⚖️',
    startMonth: 9, startDay: 23, endMonth: 10, endDay: 22,
  ),
  ZodiacSign(
    name: 'Scorpion',
    emoji: '♏',
    phrase: 'Un Scorpion dans l\'arène ? Stratège redoutable ! 🦂',
    startMonth: 10, startDay: 23, endMonth: 11, endDay: 21,
  ),
  ZodiacSign(
    name: 'Sagittaire',
    emoji: '♐',
    phrase: 'Un Sagittaire au padel ! Des coups venus d\'ailleurs ! 🏹',
    startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
  ),
  ZodiacSign(
    name: 'Capricorne',
    emoji: '♑',
    phrase: 'Un Capricorne sur le court ? Endurance et détermination ! 🏔️',
    startMonth: 12, startDay: 22, endMonth: 1, endDay: 19,
  ),
  ZodiacSign(
    name: 'Verseau',
    emoji: '♒',
    phrase: 'Un Verseau au padel ! Coups imprévisibles garantis ! 💫',
    startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
  ),
  ZodiacSign(
    name: 'Poissons',
    emoji: '♓',
    phrase: 'Un Poissons dans l\'arène ? Fluidité et créativité ! 🌊',
    startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
  ),
];

ZodiacSign? _getZodiacSign(int day, int month) {
  for (final sign in _zodiacSigns) {
    if (sign.startMonth == sign.endMonth) {
      if (month == sign.startMonth && day >= sign.startDay && day <= sign.endDay) {
        return sign;
      }
    } else if (sign.startMonth > sign.endMonth) {
      // Capricorne case (Dec-Jan)
      if ((month == sign.startMonth && day >= sign.startDay) ||
          (month == sign.endMonth && day <= sign.endDay)) {
        return sign;
      }
    } else {
      if ((month == sign.startMonth && day >= sign.startDay) ||
          (month == sign.endMonth && day <= sign.endDay)) {
        return sign;
      }
    }
  }
  return null;
}

class OnboardingBirthdateScreen extends StatefulWidget {
  final String email;
  final String prenom;
  final String nom;
  
  const OnboardingBirthdateScreen({
    super.key,
    required this.email,
    required this.prenom,
    required this.nom,
  });

  @override
  State<OnboardingBirthdateScreen> createState() => _OnboardingBirthdateScreenState();
}

class _OnboardingBirthdateScreenState extends State<OnboardingBirthdateScreen> {
  int? _selectedDay;
  int? _selectedMonth;
  int? _selectedYear;
  
  ZodiacSign? _zodiacSign;

  // Listes pour les dropdowns
  final List<String> _monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Nombre de jours par mois (index 0 = janvier)
  int _getDaysInMonth(int month, int? year) {
    // Mois avec 31 jours: 1, 3, 5, 7, 8, 10, 12
    // Mois avec 30 jours: 4, 6, 9, 11
    // Février: 28 ou 29
    if (month == 2) {
      if (year != null && _isLeapYear(year)) {
        return 29;
      }
      return 28;
    }
    if ([4, 6, 9, 11].contains(month)) {
      return 30;
    }
    return 31;
  }

  bool _isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
  }

  List<int> get _availableDays {
    if (_selectedMonth == null) {
      return List.generate(31, (i) => i + 1);
    }
    final maxDays = _getDaysInMonth(_selectedMonth!, _selectedYear);
    return List.generate(maxDays, (i) => i + 1);
  }
  
  List<int> get _years {
    final currentYear = DateTime.now().year;
    final minYear = currentYear - 90;
    final maxYear = currentYear - 10;
    return List.generate(maxYear - minYear + 1, (i) => maxYear - i);
  }

  bool get _isFormValid {
    return _selectedDay != null && _selectedMonth != null && _selectedYear != null;
  }

  DateTime? get _selectedDate {
    if (!_isFormValid) return null;
    return DateTime(_selectedYear!, _selectedMonth!, _selectedDay!);
  }

  void _validateDayForMonth() {
    if (_selectedDay != null && _selectedMonth != null) {
      final maxDays = _getDaysInMonth(_selectedMonth!, _selectedYear);
      if (_selectedDay! > maxDays) {
        _selectedDay = null; // Reset si jour invalide pour ce mois
      }
    }
  }

  void _updateZodiac() {
    setState(() {
      if (_selectedDay != null && _selectedMonth != null && _selectedYear != null) {
        _zodiacSign = _getZodiacSign(_selectedDay!, _selectedMonth!);
      } else {
        _zodiacSign = null;
      }
    });
  }

  void _onContinue() {
    if (_selectedDate != null) {
      context.navigateSlide(
        OnboardingPhoneScreen(
          email: widget.email,
          prenom: widget.prenom,
          nom: widget.nom,
          birthDate: _selectedDate!,
        ),
        routeName: '/auth/onboarding/phone',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(AppIcons.arrowBack),
                    onPressed: () => Navigator.of(context).pop(),
                    color: AppColors.iconPrimary,
                  ),
                  const Expanded(
                    child: Center(
                      child: AppLogo(size: AppLogoSize.small),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.only(
                  left: AppSpacing.lg,
                  right: AppSpacing.lg,
                  bottom: bottomPadding > 0 ? bottomPadding + 80 : AppSpacing.lg,
                ),
                child: Column(
                  children: [
                    AppSpacing.vGapLg,
                    
                    // Title
                    Text(
                      'Date de naissance',
                      style: AppTypography.headlineMedium,
                      textAlign: TextAlign.center,
                    ),
                    
                    AppSpacing.vGapXs,
                    
                    // Subtitle
                    Text(
                      'Entrez votre date de naissance',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    AppSpacing.vGapXxl,
                    
                    // Date inputs row
                    Row(
                      children: [
                        // Jour
                        Expanded(
                          flex: 2,
                          child: _buildPickerField(
                            label: 'Jour',
                            displayValue: _selectedDay?.toString().padLeft(2, '0'),
                            hint: 'Jour',
                            onTap: () => _showPicker(
                              title: 'Jour',
                              items: _availableDays.map((d) => d.toString().padLeft(2, '0')).toList(),
                              initialIndex: _selectedDay != null ? _selectedDay! - 1 : 0,
                              onSelected: (index) {
                                setState(() => _selectedDay = _availableDays[index]);
                                _updateZodiac();
                              },
                            ),
                          ),
                        ),
                        AppSpacing.hGapSm,
                        // Mois
                        Expanded(
                          flex: 3,
                          child: _buildPickerField(
                            label: 'Mois',
                            displayValue: _selectedMonth != null ? _monthNames[_selectedMonth! - 1] : null,
                            hint: 'Mois',
                            onTap: () => _showPicker(
                              title: 'Mois',
                              items: _monthNames,
                              initialIndex: _selectedMonth != null ? _selectedMonth! - 1 : 0,
                              onSelected: (index) {
                                setState(() {
                                  _selectedMonth = index + 1;
                                  _validateDayForMonth();
                                });
                                _updateZodiac();
                              },
                            ),
                          ),
                        ),
                        AppSpacing.hGapSm,
                        // Année
                        Expanded(
                          flex: 2,
                          child: _buildPickerField(
                            label: 'Année',
                            displayValue: _selectedYear?.toString(),
                            hint: 'Année',
                            onTap: () => _showPicker(
                              title: 'Année',
                              items: _years.map((y) => y.toString()).toList(),
                              initialIndex: _selectedYear != null ? _years.indexOf(_selectedYear!) : 0,
                              onSelected: (index) {
                                setState(() {
                                  _selectedYear = _years[index];
                                  _validateDayForMonth(); // Pour février bissextile
                                });
                                _updateZodiac();
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    // Zodiac sign reveal
                    if (_zodiacSign != null) ...[
                      AppSpacing.vGapXl,
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.brandPrimary.withValues(alpha: 0.1),
                              AppColors.brandSecondary.withValues(alpha: 0.1),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: AppRadius.borderRadiusLg,
                          border: Border.all(
                            color: AppColors.brandPrimary.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(
                              _zodiacSign!.emoji,
                              style: const TextStyle(fontSize: 48),
                            ),
                            AppSpacing.vGapSm,
                            Text(
                              _zodiacSign!.name,
                              style: AppTypography.titleMedium.copyWith(
                                color: AppColors.brandPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            AppSpacing.vGapSm,
                            Text(
                              _zodiacSign!.phrase,
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.textSecondary,
                                fontStyle: FontStyle.italic,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                    
                    AppSpacing.vGapXxl,
                    
                    // Progress indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildProgressDot(true),
                        AppSpacing.hGapXs,
                        _buildProgressDot(true),
                        AppSpacing.hGapXs,
                        _buildProgressDot(false),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            // Button
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.only(
                left: AppSpacing.lg,
                right: AppSpacing.lg,
                bottom: bottomPadding > 0 ? AppSpacing.sm : AppSpacing.lg,
                top: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: AppColors.backgroundPrimary,
                boxShadow: bottomPadding > 0 ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ] : null,
              ),
              child: AppButton(
                label: 'Suivant',
                onPressed: _isFormValid ? _onContinue : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isDisabled: !_isFormValid,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPicker({
    required String title,
    required List<String> items,
    required int initialIndex,
    required ValueChanged<int> onSelected,
  }) {
    int tempIndex = initialIndex >= 0 ? initialIndex : 0;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: 300,
        decoration: BoxDecoration(
          color: AppColors.surfaceDefault,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.borderDefault),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'Annuler',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Text(
                    title,
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      onSelected(tempIndex);
                      Navigator.pop(context);
                    },
                    child: Text(
                      'OK',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Picker
            Expanded(
              child: CupertinoPicker(
                scrollController: FixedExtentScrollController(
                  initialItem: initialIndex >= 0 ? initialIndex : 0,
                ),
                itemExtent: 44,
                onSelectedItemChanged: (index) => tempIndex = index,
                selectionOverlay: Container(
                  decoration: BoxDecoration(
                    border: Border.symmetric(
                      horizontal: BorderSide(
                        color: AppColors.brandPrimary.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                ),
                children: items.map((item) => Center(
                  child: Text(
                    item,
                    style: AppTypography.titleMedium.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                )).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPickerField({
    required String label,
    required String? displayValue,
    required String hint,
    required VoidCallback onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.inputLabel,
        ),
        AppSpacing.vGapXs,
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.inputBackground,
              borderRadius: AppRadius.inputBorderRadius,
              border: Border.all(
                color: displayValue != null ? AppColors.brandPrimary : AppColors.inputBorder,
                width: displayValue != null ? 1.5 : 1,
              ),
            ),
            child: Center(
              child: Text(
                displayValue ?? hint,
                style: displayValue != null
                    ? AppTypography.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      )
                    : AppTypography.inputHint,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressDot(bool isActive) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.brandPrimary : AppColors.neutral300,
        shape: BoxShape.circle,
      ),
    );
  }
}

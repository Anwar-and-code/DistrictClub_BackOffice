import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _prenomController = TextEditingController();
  final _nomController = TextEditingController();
  String? _selectedDate;
  String? _selectedGender;

  @override
  void dispose() {
    _prenomController.dispose();
    _nomController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      Navigator.of(context).pushNamedAndRemoveUntil('/main', (route) => false);
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.brandPrimary,
              onPrimary: AppColors.white,
              surface: AppColors.surfaceDefault,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        _selectedDate = '${picked.day.toString().padLeft(2, '0')} janvier ${picked.year}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(AppIcons.arrowBack),
          onPressed: () => Navigator.of(context).pop(),
          color: AppColors.iconPrimary,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.screenPadding,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                const Center(
                  child: AppLogo(
                    size: AppLogoSize.medium,
                  ),
                ),
                
                AppSpacing.vGapXl,
                
                // Icon
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      borderRadius: AppRadius.borderRadiusLg,
                    ),
                    child: Icon(
                      Icons.person_add_outlined,
                      size: 40,
                      color: AppColors.brandPrimary,
                    ),
                  ),
                ),
                
                AppSpacing.vGapLg,
                
                // Title
                Center(
                  child: Text(
                    'Inscription',
                    style: AppTypography.titleLarge,
                    textAlign: TextAlign.center,
                  ),
                ),
                
                AppSpacing.vGapXs,
                
                // Subtitle
                Center(
                  child: Text(
                    'Veuillez saisir vos informations personnel afin\nde créer votre compte de réservation',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                
                AppSpacing.vGapSm,
                
                // Phone display
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      borderRadius: AppRadius.borderRadiusSm,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.phone,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        AppSpacing.hGapXs,
                        Text(
                          '+225 07 77 46 56 00',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                AppSpacing.vGapXl,
                
                // Prénom field
                AppTextField(
                  controller: _prenomController,
                  label: 'Prénom',
                  hint: 'Entrez votre prénom',
                  prefixIcon: Icons.person_outline,
                  textCapitalization: TextCapitalization.words,
                ),
                
                AppSpacing.vGapMd,
                
                // Nom field
                AppTextField(
                  controller: _nomController,
                  label: 'Nom',
                  hint: 'Entrez votre nom',
                  prefixIcon: Icons.person_outline,
                  textCapitalization: TextCapitalization.words,
                ),
                
                AppSpacing.vGapMd,
                
                // Date de naissance
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Date de naissance',
                      style: AppTypography.inputLabel,
                    ),
                    AppSpacing.vGapXs,
                    GestureDetector(
                      onTap: _selectDate,
                      child: Container(
                        padding: AppSpacing.inputPadding,
                        decoration: BoxDecoration(
                          color: AppColors.inputBackground,
                          borderRadius: AppRadius.inputBorderRadius,
                          border: Border.all(color: AppColors.inputBorder),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.calendar_today_outlined,
                              size: AppIcons.inputIcon,
                              color: AppColors.iconSecondary,
                            ),
                            AppSpacing.hGapMd,
                            Expanded(
                              child: Text(
                                _selectedDate ?? '18 janvier 1992',
                                style: _selectedDate != null
                                    ? AppTypography.inputText
                                    : AppTypography.inputHint,
                              ),
                            ),
                            Icon(
                              Icons.arrow_drop_down,
                              color: AppColors.iconSecondary,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapMd,
                
                // Genre (Homme/Femme)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Genre',
                      style: AppTypography.inputLabel,
                    ),
                    AppSpacing.vGapXs,
                    _buildGenderSelector(),
                  ],
                ),
                
                AppSpacing.vGapXxl,
                
                // Submit button
                AppButton(
                  label: 'Suivant',
                  onPressed: _onSubmit,
                  variant: AppButtonVariant.primary,
                  size: AppButtonSize.large,
                  isFullWidth: true,
                ),
                
                AppSpacing.vGapLg,
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGenderSelector() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inputBackground,
        borderRadius: AppRadius.inputBorderRadius,
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildGenderOption('Homme', Icons.male),
          ),
          Container(
            width: 1,
            height: 48,
            color: AppColors.inputBorder,
          ),
          Expanded(
            child: _buildGenderOption('Femme', Icons.female),
          ),
        ],
      ),
    );
  }

  Widget _buildGenderOption(String label, IconData icon) {
    final isSelected = _selectedGender == label;
    
    return GestureDetector(
      onTap: () => setState(() => _selectedGender = label),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandPrimary : Colors.transparent,
          borderRadius: label == 'Homme'
              ? const BorderRadius.only(
                  topLeft: Radius.circular(AppRadius.input - 1),
                  bottomLeft: Radius.circular(AppRadius.input - 1),
                )
              : const BorderRadius.only(
                  topRight: Radius.circular(AppRadius.input - 1),
                  bottomRight: Radius.circular(AppRadius.input - 1),
                ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.white : AppColors.iconSecondary,
            ),
            AppSpacing.hGapXs,
            Text(
              label,
              style: AppTypography.labelMedium.copyWith(
                color: isSelected ? AppColors.white : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

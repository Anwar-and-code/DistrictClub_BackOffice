import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class PersonalInfoScreen extends StatefulWidget {
  const PersonalInfoScreen({super.key});

  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isEditing = false;

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _birthDateController;
  late TextEditingController _addressController;

  String _selectedLevel = 'Intermédiaire';
  String _selectedHand = 'Droitier';

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController(text: 'Alexandre');
    _lastNameController = TextEditingController(text: 'KOFFI');
    _emailController = TextEditingController(text: 'alexandre.koffi@email.com');
    _phoneController = TextEditingController(text: '+225 07 77 46 56 00');
    _birthDateController = TextEditingController(text: '15/03/1990');
    _addressController = TextEditingController(text: 'Abidjan, Cocody');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _birthDateController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        leading: IconButton(
          icon: Icon(AppIcons.arrowBack, color: AppColors.iconPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Informations personnelles',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {
              if (_isEditing) {
                if (_formKey.currentState!.validate()) {
                  setState(() => _isEditing = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Informations mises à jour'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                }
              } else {
                setState(() => _isEditing = true);
              }
            },
            child: Text(
              _isEditing ? 'Enregistrer' : 'Modifier',
              style: AppTypography.labelLarge.copyWith(
                color: AppColors.brandPrimary,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppSpacing.vGapLg,

              // Profile Picture Section
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.brandPrimary,
                          width: 3,
                        ),
                        image: const DecorationImage(
                          image: NetworkImage(
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    if (_isEditing)
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Sélection de photo'),
                                backgroundColor: AppColors.brandPrimary,
                              ),
                            );
                          },
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.white,
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              AppIcons.camera,
                              size: 16,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              AppSpacing.vGapXl,

              // Personal Information Section
              _buildSectionHeader('Identité'),
              AppSpacing.vGapMd,
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Column(
                  children: [
                    _buildTextField(
                      controller: _firstNameController,
                      label: 'Prénom',
                      icon: Icons.person_outline,
                      enabled: _isEditing,
                    ),
                    AppSpacing.vGapMd,
                    _buildTextField(
                      controller: _lastNameController,
                      label: 'Nom',
                      icon: Icons.person_outline,
                      enabled: _isEditing,
                    ),
                    AppSpacing.vGapMd,
                    _buildTextField(
                      controller: _birthDateController,
                      label: 'Date de naissance',
                      icon: Icons.cake_outlined,
                      enabled: _isEditing,
                      onTap: _isEditing ? () => _selectDate() : null,
                      readOnly: true,
                    ),
                  ],
                ),
              ),

              AppSpacing.vGapXl,

              // Contact Section
              _buildSectionHeader('Contact'),
              AppSpacing.vGapMd,
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Column(
                  children: [
                    _buildTextField(
                      controller: _emailController,
                      label: 'Email',
                      icon: Icons.email_outlined,
                      enabled: _isEditing,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    AppSpacing.vGapMd,
                    _buildTextField(
                      controller: _phoneController,
                      label: 'Téléphone',
                      icon: Icons.phone_outlined,
                      enabled: _isEditing,
                      keyboardType: TextInputType.phone,
                    ),
                    AppSpacing.vGapMd,
                    _buildTextField(
                      controller: _addressController,
                      label: 'Adresse',
                      icon: Icons.location_on_outlined,
                      enabled: _isEditing,
                    ),
                  ],
                ),
              ),

              AppSpacing.vGapXl,

              // Player Profile Section
              _buildSectionHeader('Profil joueur'),
              AppSpacing.vGapMd,
              Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: Column(
                  children: [
                    _buildDropdownField(
                      label: 'Niveau',
                      icon: Icons.trending_up,
                      value: _selectedLevel,
                      items: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
                      enabled: _isEditing,
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedLevel = value);
                        }
                      },
                    ),
                    AppSpacing.vGapMd,
                    _buildDropdownField(
                      label: 'Main dominante',
                      icon: Icons.back_hand_outlined,
                      value: _selectedHand,
                      items: ['Droitier', 'Gaucher', 'Ambidextre'],
                      enabled: _isEditing,
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedHand = value);
                        }
                      },
                    ),
                  ],
                ),
              ),

              AppSpacing.vGapXxl,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: AppSpacing.screenPaddingHorizontalOnly,
      child: Text(
        title,
        style: AppTypography.labelLarge.copyWith(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool enabled = true,
    TextInputType? keyboardType,
    VoidCallback? onTap,
    bool readOnly = false,
  }) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      readOnly: readOnly,
      keyboardType: keyboardType,
      onTap: onTap,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.iconSecondary),
        filled: true,
        fillColor: enabled ? AppColors.surfaceSubtle : AppColors.surfaceDefault,
        border: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.brandPrimary, width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Ce champ est requis';
        }
        return null;
      },
    );
  }

  Widget _buildDropdownField({
    required String label,
    required IconData icon,
    required String value,
    required List<String> items,
    required bool enabled,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.iconSecondary),
        filled: true,
        fillColor: enabled ? AppColors.surfaceSubtle : AppColors.surfaceDefault,
        border: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.borderRadiusMd,
          borderSide: BorderSide(color: AppColors.borderDefault),
        ),
      ),
      items: items.map((item) => DropdownMenuItem(
        value: item,
        child: Text(item),
      )).toList(),
      onChanged: enabled ? onChanged : null,
    );
  }

  void _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1990, 3, 15),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.brandPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _birthDateController.text = '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
      });
    }
  }
}

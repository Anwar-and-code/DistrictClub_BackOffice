import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _darkMode = false;
  String _selectedLanguage = 'Français';

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
          'Paramètres',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppSpacing.vGapMd,

            // Notifications Section
            _buildSectionHeader('Notifications'),
            AppSpacing.vGapSm,
            _buildSettingsCard([
              _SettingsTile(
                icon: AppIcons.notification,
                title: 'Notifications push',
                subtitle: 'Recevoir des notifications sur cet appareil',
                trailing: Switch(
                  value: _notificationsEnabled,
                  onChanged: (value) {
                    setState(() => _notificationsEnabled = value);
                  },
                  activeThumbColor: AppColors.brandPrimary,
                ),
              ),
              _SettingsTile(
                icon: Icons.email_outlined,
                title: 'Notifications par email',
                subtitle: 'Recevoir des emails de confirmation',
                trailing: Switch(
                  value: _emailNotifications,
                  onChanged: (value) {
                    setState(() => _emailNotifications = value);
                  },
                  activeThumbColor: AppColors.brandPrimary,
                ),
              ),
              _SettingsTile(
                icon: Icons.sms_outlined,
                title: 'Notifications SMS',
                subtitle: 'Recevoir des SMS de rappel',
                trailing: Switch(
                  value: _smsNotifications,
                  onChanged: (value) {
                    setState(() => _smsNotifications = value);
                  },
                  activeThumbColor: AppColors.brandPrimary,
                ),
              ),
            ]),

            AppSpacing.vGapXl,

            // Appearance Section
            _buildSectionHeader('Apparence'),
            AppSpacing.vGapSm,
            _buildSettingsCard([
              _SettingsTile(
                icon: Icons.dark_mode_outlined,
                title: 'Mode sombre',
                subtitle: 'Activer le thème sombre',
                trailing: Switch(
                  value: _darkMode,
                  onChanged: (value) {
                    setState(() => _darkMode = value);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Le mode sombre sera disponible prochainement'),
                        backgroundColor: AppColors.brandPrimary,
                      ),
                    );
                  },
                  activeThumbColor: AppColors.brandPrimary,
                ),
              ),
              _SettingsTile(
                icon: Icons.language,
                title: 'Langue',
                subtitle: _selectedLanguage,
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                ),
                onTap: () => _showLanguageSelector(),
              ),
            ]),

            AppSpacing.vGapXl,

            // Account Section
            _buildSectionHeader('Compte'),
            AppSpacing.vGapSm,
            _buildSettingsCard([
              _SettingsTile(
                icon: Icons.lock_outline,
                title: 'Changer le mot de passe',
                subtitle: 'Mettre à jour votre mot de passe',
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                ),
                onTap: () => _showChangePasswordDialog(),
              ),
              _SettingsTile(
                icon: Icons.security,
                title: 'Sécurité',
                subtitle: 'Authentification à deux facteurs',
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('L\'authentification 2FA sera disponible prochainement'),
                      backgroundColor: AppColors.brandPrimary,
                    ),
                  );
                },
              ),
            ]),

            AppSpacing.vGapXl,

            // Data Section
            _buildSectionHeader('Données'),
            AppSpacing.vGapSm,
            _buildSettingsCard([
              _SettingsTile(
                icon: Icons.download_outlined,
                title: 'Exporter mes données',
                subtitle: 'Télécharger une copie de vos données',
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Vos données seront envoyées par email'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
              ),
              _SettingsTile(
                icon: Icons.cached,
                title: 'Vider le cache',
                subtitle: 'Libérer de l\'espace de stockage',
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Cache vidé avec succès'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
              ),
            ]),

            AppSpacing.vGapXl,

            // Danger Zone
            _buildSectionHeader('Zone de danger'),
            AppSpacing.vGapSm,
            _buildSettingsCard([
              _SettingsTile(
                icon: Icons.delete_outline,
                title: 'Supprimer mon compte',
                subtitle: 'Supprimer définitivement votre compte',
                iconColor: AppColors.error,
                titleColor: AppColors.error,
                trailing: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.error,
                ),
                onTap: () => _showDeleteAccountDialog(),
              ),
            ]),

            AppSpacing.vGapXxl,
          ],
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

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      margin: AppSpacing.screenPaddingHorizontalOnly,
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: Column(
        children: [
          for (int i = 0; i < children.length; i++) ...[
            children[i],
            if (i < children.length - 1)
              Divider(
                height: 1,
                indent: AppSpacing.md + 40 + AppSpacing.md,
                color: AppColors.borderDefault,
              ),
          ],
        ],
      ),
    );
  }

  void _showLanguageSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choisir une langue',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapLg,
            ...[
              'Français',
              'English',
            ].map((lang) => ListTile(
                  title: Text(lang),
                  trailing: _selectedLanguage == lang
                      ? Icon(Icons.check, color: AppColors.brandPrimary)
                      : null,
                  onTap: () {
                    setState(() => _selectedLanguage = lang);
                    Navigator.pop(context);
                  },
                )),
            AppSpacing.vGapLg,
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Changer le mot de passe'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentPasswordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Mot de passe actuel',
                border: OutlineInputBorder(),
              ),
            ),
            AppSpacing.vGapMd,
            TextField(
              controller: newPasswordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Nouveau mot de passe',
                border: OutlineInputBorder(),
              ),
            ),
            AppSpacing.vGapMd,
            TextField(
              controller: confirmPasswordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Confirmer le mot de passe',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Mot de passe modifié avec succès'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: Text('Confirmer'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Supprimer mon compte'),
        content: Text(
          'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Un email de confirmation vous a été envoyé'),
                  backgroundColor: AppColors.warning,
                ),
              );
            },
            child: Text(
              'Supprimer',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
    this.iconColor,
    this.titleColor,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? iconColor;
  final Color? titleColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: (iconColor ?? AppColors.brandPrimary).withValues(alpha: 0.1),
                  borderRadius: AppRadius.borderRadiusMd,
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: iconColor ?? AppColors.brandPrimary,
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w500,
                        color: titleColor,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
        ),
      ),
    );
  }
}

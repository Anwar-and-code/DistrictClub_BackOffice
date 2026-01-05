import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

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
          'Conditions d\'utilisation',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.screenPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dernière mise à jour : 1er janvier 2026',
              style: AppTypography.caption.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
            AppSpacing.vGapLg,

            _LegalSection(
              title: '1. Acceptation des conditions',
              content: '''
En utilisant l'application PadelHouse, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

L'utilisation de notre application implique l'acceptation pleine et entière des présentes conditions générales d'utilisation.
''',
            ),

            _LegalSection(
              title: '2. Description du service',
              content: '''
PadelHouse est une plateforme de réservation de terrains de padel permettant aux utilisateurs de :
• Réserver des créneaux horaires sur les terrains disponibles
• Gérer leurs réservations (modification, annulation)
• Participer à des événements et tournois
• Communiquer avec d'autres joueurs via la messagerie intégrée
• Accéder à leur historique de parties
''',
            ),

            _LegalSection(
              title: '3. Inscription et compte utilisateur',
              content: '''
Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion.

Vous devez avoir au moins 16 ans pour créer un compte. Les mineurs doivent obtenir l'autorisation de leurs parents ou tuteurs légaux.
''',
            ),

            _LegalSection(
              title: '4. Réservations et paiements',
              content: '''
Les réservations sont confirmées après paiement intégral. Les tarifs affichés sont en Francs CFA (XOF) et incluent toutes les taxes applicables.

Politique d'annulation :
• Annulation gratuite jusqu'à 24h avant le créneau réservé
• 50% de frais d'annulation entre 24h et 12h avant
• Aucun remboursement pour les annulations tardives (moins de 12h)
''',
            ),

            _LegalSection(
              title: '5. Règles de conduite',
              content: '''
Les utilisateurs s'engagent à :
• Respecter les autres joueurs et le personnel
• Arriver à l'heure pour leurs réservations
• Maintenir les installations en bon état
• Ne pas utiliser l'application à des fins illégales
• Ne pas publier de contenu offensant ou inapproprié
''',
            ),

            _LegalSection(
              title: '6. Propriété intellectuelle',
              content: '''
Tous les éléments de l'application (logo, design, code, contenu) sont la propriété exclusive de PadelHouse et sont protégés par les lois sur la propriété intellectuelle.

Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.
''',
            ),

            _LegalSection(
              title: '7. Limitation de responsabilité',
              content: '''
PadelHouse ne peut être tenu responsable :
• Des dommages indirects liés à l'utilisation du service
• Des interruptions de service dues à des maintenances
• Des actes de tiers ou des cas de force majeure
• Des blessures survenues pendant la pratique du padel
''',
            ),

            _LegalSection(
              title: '8. Modifications des conditions',
              content: '''
PadelHouse se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par notification dans l'application.

L'utilisation continue de l'application après modification vaut acceptation des nouvelles conditions.
''',
            ),

            _LegalSection(
              title: '9. Contact',
              content: '''
Pour toute question concernant ces conditions d'utilisation, contactez-nous :

Email : legal@padelhouse.ci
Téléphone : +225 07 77 46 56 00
Adresse : Abidjan, Cocody, Côte d'Ivoire
''',
            ),

            AppSpacing.vGapXl,

            Center(
              child: Text(
                '© 2026 PadelHouse. Tous droits réservés.',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ),

            AppSpacing.vGapXl,
          ],
        ),
      ),
    );
  }
}

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
          'Politique de confidentialité',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.screenPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dernière mise à jour : 1er janvier 2026',
              style: AppTypography.caption.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
            AppSpacing.vGapLg,

            _LegalSection(
              title: '1. Introduction',
              content: '''
PadelHouse s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.

En utilisant notre application, vous acceptez les pratiques décrites dans cette politique.
''',
            ),

            _LegalSection(
              title: '2. Données collectées',
              content: '''
Nous collectons les types de données suivants :

Données d'identification :
• Nom et prénom
• Adresse email
• Numéro de téléphone
• Photo de profil (optionnel)

Données d'utilisation :
• Historique de réservations
• Préférences de jeu
• Interactions avec l'application

Données techniques :
• Type d'appareil
• Version du système d'exploitation
• Adresse IP
''',
            ),

            _LegalSection(
              title: '3. Utilisation des données',
              content: '''
Vos données sont utilisées pour :
• Gérer votre compte et vos réservations
• Vous envoyer des confirmations et rappels
• Améliorer nos services
• Personnaliser votre expérience
• Assurer la sécurité de la plateforme
• Communiquer sur nos offres (avec votre consentement)
''',
            ),

            _LegalSection(
              title: '4. Partage des données',
              content: '''
Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :

• Les clubs de padel partenaires pour la gestion des réservations
• Les prestataires de paiement pour traiter les transactions
• Les autorités compétentes si la loi l'exige

Tous nos partenaires sont tenus de respecter la confidentialité de vos données.
''',
            ),

            _LegalSection(
              title: '5. Sécurité des données',
              content: '''
Nous mettons en œuvre des mesures de sécurité robustes :
• Chiffrement des données en transit et au repos
• Authentification sécurisée
• Accès restreint aux données personnelles
• Audits de sécurité réguliers
• Sauvegarde automatique des données
''',
            ),

            _LegalSection(
              title: '6. Conservation des données',
              content: '''
Vos données sont conservées :
• Pendant la durée de votre compte actif
• 3 ans après la suppression du compte pour les données de facturation
• Conformément aux obligations légales applicables

Vous pouvez demander la suppression de vos données à tout moment.
''',
            ),

            _LegalSection(
              title: '7. Vos droits',
              content: '''
Conformément à la réglementation, vous disposez des droits suivants :
• Droit d'accès à vos données
• Droit de rectification
• Droit à l'effacement
• Droit à la portabilité
• Droit d'opposition au traitement
• Droit de retrait du consentement

Pour exercer ces droits, contactez-nous à : privacy@padelhouse.ci
''',
            ),

            _LegalSection(
              title: '8. Cookies et technologies similaires',
              content: '''
Nous utilisons des cookies et technologies similaires pour :
• Maintenir votre session de connexion
• Mémoriser vos préférences
• Analyser l'utilisation de l'application
• Améliorer nos services

Vous pouvez gérer vos préférences de cookies dans les paramètres de l'application.
''',
            ),

            _LegalSection(
              title: '9. Modifications de cette politique',
              content: '''
Nous pouvons mettre à jour cette politique de confidentialité. En cas de modifications importantes, nous vous en informerons par notification dans l'application ou par email.

Nous vous encourageons à consulter régulièrement cette page.
''',
            ),

            _LegalSection(
              title: '10. Contact',
              content: '''
Pour toute question concernant cette politique de confidentialité :

Délégué à la Protection des Données
Email : privacy@padelhouse.ci
Téléphone : +225 07 77 46 56 00
Adresse : Abidjan, Cocody, Côte d'Ivoire
''',
            ),

            AppSpacing.vGapXl,

            Center(
              child: Text(
                '© 2026 PadelHouse. Tous droits réservés.',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ),

            AppSpacing.vGapXl,
          ],
        ),
      ),
    );
  }
}

class _LegalSection extends StatelessWidget {
  const _LegalSection({
    required this.title,
    required this.content,
  });

  final String title;
  final String content;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTypography.titleSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          AppSpacing.vGapSm,
          Text(
            content.trim(),
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

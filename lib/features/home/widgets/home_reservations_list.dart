import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class HomeReservationsList extends StatelessWidget {
  const HomeReservationsList({super.key});

  // Sample data - in real app, this would come from a service
  static const int _upcomingCount = 1;

  void _showReservationDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.borderDefault,
                      borderRadius: AppRadius.borderRadiusFull,
                    ),
                  ),
                ),
                AppSpacing.vGapLg,
                
                // Header
                Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.brandSecondary,
                        borderRadius: AppRadius.borderRadiusMd,
                      ),
                      child: Center(
                        child: Text(
                          'A',
                          style: AppTypography.headlineMedium.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Terrain A',
                            style: AppTypography.titleLarge.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'PadelHouse Cocody',
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppBadge(
                      label: 'Confirmé',
                      variant: AppBadgeVariant.success,
                    ),
                  ],
                ),
                
                AppSpacing.vGapXl,
                
                // Details
                _DetailRow(icon: Icons.calendar_today, label: 'Date', value: 'Mercredi 8 Janvier 2026'),
                _DetailRow(icon: Icons.access_time, label: 'Horaire', value: '19:00 - 20:30'),
                _DetailRow(icon: Icons.timer, label: 'Durée', value: '1h30'),
                _DetailRow(icon: Icons.payments, label: 'Montant', value: '25 000 F CFA'),
                _DetailRow(icon: Icons.confirmation_number, label: 'Référence', value: 'WP-X0126'),
                
                AppSpacing.vGapXl,
                
                // QR Code section
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.qr_code_2, size: 80, color: AppColors.brandPrimary),
                      AppSpacing.vGapSm,
                      Text(
                        'Présentez ce QR code à l\'accueil',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                
                AppSpacing.vGapXl,
                
                // Actions
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Modifier',
                        variant: AppButtonVariant.outline,
                        icon: Icons.edit,
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Redirection vers la modification...'),
                              backgroundColor: AppColors.brandPrimary,
                            ),
                          );
                        },
                      ),
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: AppButton(
                        label: 'Annuler',
                        variant: AppButtonVariant.outline,
                        icon: Icons.close,
                        onPressed: () {
                          Navigator.pop(context);
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: Text('Annuler la réservation ?'),
                              content: Text('Vous pouvez annuler gratuitement jusqu\'à 24h avant.'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: Text('Non'),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Réservation annulée'),
                                        backgroundColor: AppColors.warning,
                                      ),
                                    );
                                  },
                                  child: Text('Oui, annuler', style: TextStyle(color: AppColors.error)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                
                AppSpacing.vGapLg,
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header with badge
        Row(
          children: [
            Expanded(
              child: AppSectionHeader(
                title: 'Réservations',
                action: 'Voir tout',
                onActionTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          Icon(AppIcons.calendar, color: AppColors.white),
                          AppSpacing.hGapSm,
                          Expanded(child: Text('Rendez-vous dans l\'onglet "Réservations"')),
                        ],
                      ),
                      backgroundColor: AppColors.brandPrimary,
                      duration: const Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        AppSpacing.vGapMd,

        // Upcoming reservation highlight
        if (_upcomingCount > 0) ...[
          _UpcomingReservationCard(
            courtName: 'A',
            date: 'Mer 8 Jan',
            startTime: '19:00',
            endTime: '20:30',
            price: '25 000 F',
            onTap: () {
              _showReservationDetails(context);
            },
          ),
          AppSpacing.vGapLg,
        ],

        // Past reservations
        Text(
          'Historique récent',
          style: AppTypography.labelMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.vGapSm,
        _ReservationCard(
          reference: 'WP-X0125',
          courtName: 'A',
          date: '6 Jan 2026',
          startTime: '13:00',
          endTime: '14:00',
          price: '15 000 F',
          onTap: () {
            DefaultTabController.of(context).animateTo(1);
          },
        ),
        AppSpacing.vGapSm,
        _ReservationCard(
          reference: 'WP-X0124',
          courtName: 'B',
          date: '3 Jan 2026',
          startTime: '16:00',
          endTime: '17:30',
          price: '20 000 F',
          onTap: () {
            DefaultTabController.of(context).animateTo(1);
          },
        ),
      ],
    );
  }
}

// Highlighted card for upcoming reservation
class _UpcomingReservationCard extends StatelessWidget {
  const _UpcomingReservationCard({
    required this.courtName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.price,
    this.onTap,
  });

  final String courtName;
  final String date;
  final String startTime;
  final String endTime;
  final String price;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.brandOlive,
            AppColors.brandOlive.withValues(alpha: 0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.borderRadiusMd,
        boxShadow: [
          BoxShadow(
            color: AppColors.brandOlive.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.borderRadiusMd,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.borderRadiusMd,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.white.withValues(alpha: 0.2),
                        borderRadius: AppRadius.borderRadiusFull,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            AppIcons.calendarFilled,
                            color: AppColors.white,
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Prochaine réservation',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Icon(
                      AppIcons.chevronRight,
                      color: AppColors.white.withValues(alpha: 0.8),
                      size: 20,
                    ),
                  ],
                ),
                AppSpacing.vGapMd,
                
                // Main content
                Row(
                  children: [
                    // Court badge
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: AppRadius.borderRadiusSm,
                      ),
                      child: Center(
                        child: Text(
                          courtName,
                          style: AppTypography.headlineSmall.copyWith(
                            color: AppColors.brandOlive,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    AppSpacing.hGapMd,
                    
                    // Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            date,
                            style: AppTypography.titleMedium.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          AppSpacing.vGapXxs,
                          Text(
                            '$startTime - $endTime',
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Price
                    Text(
                      price,
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({
    required this.reference,
    required this.courtName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.price,
    this.onTap,
  });

  final String reference;
  final String courtName;
  final String date;
  final String startTime;
  final String endTime;
  final String price;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.reservationCardBorder),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.cardBorderRadius,
          child: Row(
            children: [
              // Time badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  color: AppColors.reservationTimeBadge,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(AppRadius.card - 1),
                    bottomLeft: Radius.circular(AppRadius.card - 1),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      startTime,
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      endTime,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),

              // Details
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Terrain $courtName',
                            style: AppTypography.labelMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            '  •  $date',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.vGapXxs,
                      Text(
                        '$price  •  Réf: $reference',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Arrow
              Padding(
                padding: const EdgeInsets.only(right: AppSpacing.md),
                child: Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                  size: AppIcons.sizeMd,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.iconSecondary),
          AppSpacing.hGapMd,
          Text(
            label,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

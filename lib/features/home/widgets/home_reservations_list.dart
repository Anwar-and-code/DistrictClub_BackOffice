import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class HomeReservationsList extends StatelessWidget {
  const HomeReservationsList({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppSectionHeader(
          title: 'Dernières réservations',
          action: 'Voir tout',
          onActionTap: () {
            // Navigate to all reservations
          },
        ),
        AppSpacing.vGapMd,
        const AppDateHeader(date: '12/09/2023'),
        AppSpacing.vGapSm,
        _ReservationCard(
          reference: 'WP-X0123',
          courtName: 'Terrain T01',
          startTime: '13:00',
          endTime: '14:00',
          price: '20 000 F',
          onTap: () {},
        ),
        AppSpacing.vGapSm,
        _ReservationCard(
          reference: 'WP-X0124',
          courtName: 'Terrain T01',
          startTime: '13:00',
          endTime: '14:00',
          price: '20 000 F',
          onTap: () {},
        ),
        AppSpacing.vGapMd,
        const AppDateHeader(date: '10/09/2023'),
        AppSpacing.vGapSm,
        _ReservationCard(
          reference: 'WP-X0120',
          courtName: 'Terrain T02',
          startTime: '16:00',
          endTime: '17:30',
          price: '25 000 F',
          onTap: () {},
        ),
      ],
    );
  }
}

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({
    required this.reference,
    required this.courtName,
    required this.startTime,
    required this.endTime,
    required this.price,
    this.onTap,
  });

  final String reference;
  final String courtName;
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
                      Text(
                        'Réf: $reference',
                        style: AppTypography.titleSmall,
                      ),
                      AppSpacing.vGapXxs,
                      Text(
                        '$courtName  |  $price',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
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

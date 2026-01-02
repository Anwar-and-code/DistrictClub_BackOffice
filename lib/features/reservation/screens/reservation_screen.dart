import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({super.key});

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  DateTime _selectedDate = DateTime.now();
  String? _selectedCourt;
  String? _selectedSlot;

  final List<Court> _courts = [
    Court(id: 'A', name: 'Terrain A', isAvailable: true),
    Court(id: 'B', name: 'Terrain B', isAvailable: true),
    Court(id: 'C', name: 'Terrain C', isAvailable: false),
    Court(id: 'D', name: 'Terrain D', isAvailable: true),
  ];

  final List<TimeSlot> _morningSlots = [
    TimeSlot(id: '1', time: '08:00 - 09:00', price: 15000, isAvailable: true),
    TimeSlot(id: '2', time: '09:00 - 10:00', price: 15000, isAvailable: false),
    TimeSlot(id: '3', time: '10:00 - 11:00', price: 15000, isAvailable: true),
    TimeSlot(id: '4', time: '11:00 - 12:00', price: 15000, isAvailable: true),
    TimeSlot(id: '5', time: '12:00 - 13:00', price: 15000, isAvailable: false),
    TimeSlot(id: '6', time: '13:00 - 14:00', price: 15000, isAvailable: true),
    TimeSlot(id: '7', time: '14:00 - 15:00', price: 15000, isAvailable: true),
    TimeSlot(id: '8', time: '15:00 - 16:00', price: 15000, isAvailable: true),
  ];

  final List<TimeSlot> _eveningSlots = [
    TimeSlot(id: '9', time: '16:00 - 17:30', price: 20000, isAvailable: true),
    TimeSlot(id: '10', time: '17:30 - 19:00', price: 20000, isAvailable: false),
    TimeSlot(id: '11', time: '19:00 - 20:30', price: 25000, isAvailable: true),
    TimeSlot(id: '12', time: '20:30 - 22:00', price: 25000, isAvailable: true),
    TimeSlot(id: '13', time: '22:00 - 23:30', price: 20000, isAvailable: true),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        title: const Text(
          'Réservation',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date selector
            _buildDateSelector(),

            AppSpacing.vGapLg,

            // Court selector
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const AppSectionHeader(title: 'Sélectionner un terrain'),
                  AppSpacing.vGapMd,
                  _buildCourtSelector(),
                ],
              ),
            ),

            AppSpacing.vGapXl,

            // Time slots
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const AppSectionHeader(title: 'Créneaux disponibles'),
                  AppSpacing.vGapMd,

                  // Morning slots (1h)
                  Text(
                    'Matinée (1h)',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  AppSpacing.vGapSm,
                  _buildTimeSlotGrid(_morningSlots),

                  AppSpacing.vGapLg,

                  // Evening slots (1h30)
                  Text(
                    'Soirée (1h30)',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  AppSpacing.vGapSm,
                  _buildTimeSlotGrid(_eveningSlots),
                ],
              ),
            ),

            AppSpacing.vGapXxl,

            // Book button
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: AppButton(
                label: 'Réserver maintenant',
                onPressed: _selectedCourt != null && _selectedSlot != null
                    ? _onBookPressed
                    : null,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
                isDisabled: _selectedCourt == null || _selectedSlot == null,
              ),
            ),

            AppSpacing.vGapXxl,
          ],
        ),
      ),
    );
  }

  Widget _buildDateSelector() {
    final now = DateTime.now();
    final dates = List.generate(14, (i) => now.add(Duration(days: i)));

    return SizedBox(
      height: 90,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: AppSpacing.screenPaddingHorizontalOnly,
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final isSelected = _selectedDate.day == date.day &&
              _selectedDate.month == date.month;

          return Padding(
            padding: EdgeInsets.only(right: AppSpacing.sm),
            child: _DateCard(
              date: date,
              isSelected: isSelected,
              onTap: () => setState(() => _selectedDate = date),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCourtSelector() {
    return Row(
      children: _courts.map((court) {
        final isSelected = _selectedCourt == court.id;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: court != _courts.last ? AppSpacing.sm : 0,
            ),
            child: _CourtCard(
              court: court,
              isSelected: isSelected,
              onTap: court.isAvailable
                  ? () => setState(() => _selectedCourt = court.id)
                  : null,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTimeSlotGrid(List<TimeSlot> slots) {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: slots.map((slot) {
        final isSelected = _selectedSlot == slot.id;
        return _TimeSlotChip(
          slot: slot,
          isSelected: isSelected,
          onTap: slot.isAvailable
              ? () => setState(() => _selectedSlot = slot.id)
              : null,
        );
      }).toList(),
    );
  }

  void _onBookPressed() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BookingConfirmationSheet(
        court: _courts.firstWhere((c) => c.id == _selectedCourt),
        slot: [..._morningSlots, ..._eveningSlots]
            .firstWhere((s) => s.id == _selectedSlot),
        date: _selectedDate,
      ),
    );
  }
}

class _DateCard extends StatelessWidget {
  const _DateCard({
    required this.date,
    required this.isSelected,
    this.onTap,
  });

  final DateTime date;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    final monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationNormal,
        width: 60,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandPrimary : AppColors.surfaceSubtle,
          borderRadius: AppRadius.borderRadiusMd,
          border: isSelected
              ? null
              : Border.all(color: AppColors.borderDefault),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              dayNames[date.weekday - 1],
              style: AppTypography.caption.copyWith(
                color: isSelected ? AppColors.white : AppColors.textSecondary,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              date.day.toString(),
              style: AppTypography.titleMedium.copyWith(
                color: isSelected ? AppColors.white : AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              monthNames[date.month - 1],
              style: AppTypography.caption.copyWith(
                color: isSelected ? AppColors.white : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CourtCard extends StatelessWidget {
  const _CourtCard({
    required this.court,
    required this.isSelected,
    this.onTap,
  });

  final Court court;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDisabled = !court.isAvailable;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationNormal,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: isDisabled
              ? AppColors.neutral100
              : isSelected
                  ? AppColors.brandPrimary
                  : AppColors.surfaceDefault,
          borderRadius: AppRadius.borderRadiusMd,
          border: isSelected || isDisabled
              ? null
              : Border.all(color: AppColors.borderDefault),
        ),
        child: Column(
          children: [
            Icon(
              AppIcons.sportsTennis,
              size: 24,
              color: isDisabled
                  ? AppColors.neutral400
                  : isSelected
                      ? AppColors.white
                      : AppColors.brandPrimary,
            ),
            AppSpacing.vGapXs,
            Text(
              court.name,
              style: AppTypography.labelSmall.copyWith(
                color: isDisabled
                    ? AppColors.neutral400
                    : isSelected
                        ? AppColors.white
                        : AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (isDisabled) ...[
              AppSpacing.vGapXxs,
              Text(
                'Indisponible',
                style: AppTypography.caption.copyWith(
                  color: AppColors.error,
                  fontSize: 9,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TimeSlotChip extends StatelessWidget {
  const _TimeSlotChip({
    required this.slot,
    required this.isSelected,
    this.onTap,
  });

  final TimeSlot slot;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDisabled = !slot.isAvailable;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationNormal,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isDisabled
              ? AppColors.neutral100
              : isSelected
                  ? AppColors.brandPrimary
                  : AppColors.surfaceDefault,
          borderRadius: AppRadius.borderRadiusSm,
          border: isSelected || isDisabled
              ? null
              : Border.all(color: AppColors.borderDefault),
        ),
        child: Column(
          children: [
            Text(
              slot.time,
              style: AppTypography.labelSmall.copyWith(
                color: isDisabled
                    ? AppColors.neutral400
                    : isSelected
                        ? AppColors.white
                        : AppColors.textPrimary,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              '${slot.price.toStringAsFixed(0)} F',
              style: AppTypography.caption.copyWith(
                color: isDisabled
                    ? AppColors.neutral400
                    : isSelected
                        ? AppColors.white.withValues(alpha: 0.8)
                        : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BookingConfirmationSheet extends StatelessWidget {
  const _BookingConfirmationSheet({
    required this.court,
    required this.slot,
    required this.date,
  });

  final Court court;
  final TimeSlot slot;
  final DateTime date;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.screenPadding,
      decoration: BoxDecoration(
        color: AppColors.surfaceDefault,
        borderRadius: AppRadius.topXxl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.neutral300,
              borderRadius: AppRadius.borderRadiusFull,
            ),
          ),
          AppSpacing.vGapLg,

          // Title
          Text(
            'Confirmer la réservation',
            style: AppTypography.titleLarge,
          ),
          AppSpacing.vGapXl,

          // Details
          _buildDetailRow('Terrain', court.name),
          AppSpacing.vGapMd,
          _buildDetailRow('Date', '${date.day}/${date.month}/${date.year}'),
          AppSpacing.vGapMd,
          _buildDetailRow('Créneau', slot.time),
          AppSpacing.vGapMd,
          _buildDetailRow('Prix', '${slot.price.toStringAsFixed(0)} FCFA'),

          AppSpacing.vGapXl,

          // Buttons
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Annuler',
                  onPressed: () => Navigator.pop(context),
                  variant: AppButtonVariant.outline,
                ),
              ),
              AppSpacing.hGapMd,
              Expanded(
                child: AppButton(
                  label: 'Confirmer',
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Réservation confirmée !'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                  variant: AppButtonVariant.primary,
                ),
              ),
            ],
          ),

          AppSpacing.vGapLg,
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class Court {
  final String id;
  final String name;
  final bool isAvailable;

  Court({required this.id, required this.name, required this.isAvailable});
}

class TimeSlot {
  final String id;
  final String time;
  final double price;
  final bool isAvailable;

  TimeSlot({
    required this.id,
    required this.time,
    required this.price,
    required this.isAvailable,
  });
}

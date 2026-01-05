import 'package:flutter/material.dart';
import 'dart:ui' as ui;
import '../../../core/design_system/design_system.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({super.key});

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  int _currentTab = 0;
  DateTime? _selectedDate;
  bool _isDateExpanded = true;
  String? _selectedCourt;
  String? _selectedSlot;

  final List<Booking> _bookingHistory = [
    Booking(
      reference: 'WP-X0125',
      courtName: 'A',
      date: DateTime.now().subtract(const Duration(days: 2)),
      startTime: '13:00',
      endTime: '14:00',
      price: 15000,
      status: BookingStatus.completed,
    ),
    Booking(
      reference: 'WP-X0124',
      courtName: 'B',
      date: DateTime.now().subtract(const Duration(days: 5)),
      startTime: '16:00',
      endTime: '17:30',
      price: 20000,
      status: BookingStatus.completed,
    ),
    Booking(
      reference: 'WP-X0123',
      courtName: 'A',
      date: DateTime.now().add(const Duration(days: 3)),
      startTime: '19:00',
      endTime: '20:30',
      price: 25000,
      status: BookingStatus.upcoming,
    ),
    Booking(
      reference: 'WP-X0122',
      courtName: 'D',
      date: DateTime.now().subtract(const Duration(days: 10)),
      startTime: '10:00',
      endTime: '11:00',
      price: 15000,
      status: BookingStatus.completed,
    ),
    Booking(
      reference: 'WP-X0121',
      courtName: 'C',
      date: DateTime.now().subtract(const Duration(days: 15)),
      startTime: '14:00',
      endTime: '15:00',
      price: 15000,
      status: BookingStatus.cancelled,
    ),
  ];

  int get _upcomingCount => _bookingHistory
      .where((b) => b.status == BookingStatus.upcoming)
      .length;

  final List<Court> _courts = [
    Court(id: 'A', name: 'A', isAvailable: true),
    Court(id: 'B', name: 'B', isAvailable: true),
    Court(id: 'C', name: 'C', isAvailable: false),
    Court(id: 'D', name: 'D', isAvailable: true),
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
        title: Text(
          'Réservation',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Tab selector
          _buildTabSelector(),
          
          // Tab content
          Expanded(
            child: _currentTab == 0 ? _buildBookingTab() : _buildHistoryTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabSelector() {
    return Container(
      margin: AppSpacing.screenPaddingHorizontalOnly,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppRadius.borderRadiusMd,
      ),
      child: Row(
        children: [
          Expanded(
            child: _TabButton(
              label: 'Nouvelle réservation',
              isSelected: _currentTab == 0,
              onTap: () => setState(() => _currentTab = 0),
            ),
          ),
          Expanded(
            child: _TabButton(
              label: 'Historique',
              isSelected: _currentTab == 1,
              onTap: () => setState(() => _currentTab = 1),
              badgeCount: _upcomingCount,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSpacing.vGapLg,
          
          // Step 1: Date selector (always visible)
          Padding(
            padding: AppSpacing.screenPaddingHorizontalOnly,
            child: GestureDetector(
              onTap: () {
                if (!_isDateExpanded) {
                  setState(() => _isDateExpanded = true);
                }
              },
              child: _buildStepHeader(
                step: 1,
                title: 'Choisir une date',
                isCompleted: _selectedDate != null,
                showEditAction: !_isDateExpanded,
              ),
            ),
          ),
          AppSpacing.vGapMd,
          
          AnimatedCrossFade(
            firstChild: _buildDateSelector(),
            secondChild: _selectedDate != null 
                ? _buildSelectedDateSummary() 
                : const SizedBox.shrink(),
            crossFadeState: _isDateExpanded 
                ? CrossFadeState.showFirst 
                : CrossFadeState.showSecond,
            duration: AppAnimations.durationNormal,
          ),

          // Step 2: Time slots (visible after date selection)
          if (_selectedDate != null) ...[
            AppSpacing.vGapXl,
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStepHeader(
                    step: 2,
                    title: 'Choisir un créneau',
                    isCompleted: _selectedSlot != null,
                  ),
                  AppSpacing.vGapMd,

                  // Morning slots section
                  _buildPeriodHeader(
                    icon: Icons.wb_sunny_outlined,
                    title: 'Matinée',
                    subtitle: '1h · 15 000 F',
                    iconColor: AppColors.warning,
                  ),
                  AppSpacing.vGapSm,
                ],
              ),
            ),
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly.copyWith(right: 0),
              child: _buildTimeSlotTimeline(_morningSlots, periodIcon: '☀️'),
            ),
            
            AppSpacing.vGapLg,
            
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Evening slots section
                  _buildPeriodHeader(
                    icon: Icons.nights_stay_outlined,
                    title: 'Soirée',
                    subtitle: '1h30 · 20 000 - 25 000 F',
                    iconColor: AppColors.brandSecondary,
                  ),
                  AppSpacing.vGapSm,
                ],
              ),
            ),
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly.copyWith(right: 0),
              child: _buildTimeSlotTimeline(_eveningSlots, periodIcon: '🌙'),
            ),
          ],

          // Step 3: Court selector (visible after slot selection)
          if (_selectedSlot != null) ...[
            AppSpacing.vGapXl,
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStepHeader(
                    step: 3,
                    title: 'Choisir un terrain',
                    isCompleted: _selectedCourt != null,
                  ),
                  AppSpacing.vGapMd,
                  _buildCourtSelector(),
                ],
              ),
            ),
          ],

          // Book button (visible when all selections made)
          if (_selectedDate != null && _selectedSlot != null && _selectedCourt != null) ...[
            AppSpacing.vGapXxl,
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: AppButton(
                label: 'Réserver maintenant',
                onPressed: _onBookPressed,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.large,
                isFullWidth: true,
              ),
            ),
          ],

          AppSpacing.vGapXxl,
        ],
      ),
    );
  }

  Widget _buildStepHeader({
    required int step,
    required String title,
    required bool isCompleted,
    bool showEditAction = false,
  }) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isCompleted ? AppColors.success : AppColors.brandPrimary,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isCompleted
                ? Icon(Icons.check, color: AppColors.white, size: 16)
                : Text(
                    step.toString(),
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        AppSpacing.hGapSm,
        Expanded(
          child: Text(
            title,
            style: AppTypography.titleSmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        if (showEditAction) ...[
          Text(
            'Modifier',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.brandPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSelectedDateSummary() {
    if (_selectedDate == null) return const SizedBox.shrink();
    
    final dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    final monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    final dateStr = '${dayNames[_selectedDate!.weekday - 1]} ${_selectedDate!.day} ${monthNames[_selectedDate!.month - 1]}';

    return GestureDetector(
      onTap: () => setState(() => _isDateExpanded = true),
      child: Container(
        margin: AppSpacing.screenPaddingHorizontalOnly,
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: AppColors.brandPrimary.withValues(alpha: 0.05),
          borderRadius: AppRadius.borderRadiusMd,
          border: Border.all(color: AppColors.brandPrimary.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            Icon(
              Icons.calendar_month,
              color: AppColors.brandPrimary,
              size: 20,
            ),
            AppSpacing.hGapMd,
            Text(
              dateStr,
              style: AppTypography.titleSmall.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            Icon(
              Icons.edit_outlined,
              color: AppColors.brandPrimary,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTab() {
    final upcomingBookings = _bookingHistory
        .where((b) => b.status == BookingStatus.upcoming)
        .toList();
    final pastBookings = _bookingHistory
        .where((b) => b.status != BookingStatus.upcoming)
        .toList();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSpacing.vGapLg,
          
          // Upcoming reservations section with highlight
          if (upcomingBookings.isNotEmpty) ...[
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.brandSecondary.withValues(alpha: 0.1),
                  borderRadius: AppRadius.borderRadiusMd,
                  border: Border.all(
                    color: AppColors.brandSecondary.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandSecondary,
                            borderRadius: AppRadius.borderRadiusFull,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.event_available,
                                color: AppColors.white,
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '${upcomingBookings.length} réservation${upcomingBookings.length > 1 ? 's' : ''} à venir',
                                style: AppTypography.labelMedium.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    AppSpacing.vGapMd,
                    ...upcomingBookings.map((booking) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: _BookingHistoryCard(
                        booking: booking,
                        isHighlighted: true,
                      ),
                    )),
                  ],
                ),
              ),
            ),
            AppSpacing.vGapXl,
          ] else ...[
            // Empty state for no upcoming reservations
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppRadius.borderRadiusMd,
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      color: AppColors.iconSecondary,
                      size: 32,
                    ),
                    AppSpacing.hGapMd,
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Aucune réservation à venir',
                            style: AppTypography.labelLarge.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          AppSpacing.vGapXxs,
                          Text(
                            'Réservez un terrain pour votre prochaine partie !',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            AppSpacing.vGapXl,
          ],

          // Past reservations
          Padding(
            padding: AppSpacing.screenPaddingHorizontalOnly,
            child: Text(
              'Historique',
              style: AppTypography.titleSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          AppSpacing.vGapMd,
          if (pastBookings.isEmpty)
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Text(
                'Aucune réservation passée',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            )
          else
            ...pastBookings.map((booking) => Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: _BookingHistoryCard(booking: booking),
              ),
            )),
          
          AppSpacing.vGapXxl,
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    final now = DateTime.now();
    final dates = List.generate(14, (i) => now.add(Duration(days: i)));

    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: AppSpacing.screenPaddingHorizontalOnly,
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final isSelected = _selectedDate != null &&
              _selectedDate!.day == date.day &&
              _selectedDate!.month == date.month;

          return Padding(
            padding: EdgeInsets.only(right: AppSpacing.sm),
            child: _DateCard(
              date: date,
              isSelected: isSelected,
              onTap: () => setState(() {
                _selectedDate = date;
                _isDateExpanded = false; // Collapse after selection
                // Reset downstream selections when date changes
                _selectedSlot = null;
                _selectedCourt = null;
              }),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCourtSelector() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppSpacing.sm,
        mainAxisSpacing: AppSpacing.sm,
        childAspectRatio: 1.2,
      ),
      itemCount: _courts.length,
      itemBuilder: (context, index) {
        final court = _courts[index];
        final isSelected = _selectedCourt == court.id;
        return _CourtCard(
          court: court,
          isSelected: isSelected,
          onTap: court.isAvailable
              ? () => setState(() => _selectedCourt = court.id)
              : null,
        );
      },
    );
  }

  Widget _buildPeriodHeader({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: AppRadius.borderRadiusSm,
          ),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        AppSpacing.hGapSm,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: AppTypography.labelLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              subtitle,
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTimeSlotTimeline(List<TimeSlot> slots, {required String periodIcon}) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: slots.length,
        itemBuilder: (context, index) {
          final slot = slots[index];
          final isSelected = _selectedSlot == slot.id;
          return Padding(
            padding: EdgeInsets.only(
              right: index < slots.length - 1 ? AppSpacing.sm : 0,
            ),
            child: _TimeSlotCard(
              slot: slot,
              isSelected: isSelected,
              periodIcon: periodIcon,
              onTap: slot.isAvailable
                  ? () => setState(() => _selectedSlot = slot.id)
                  : null,
            ),
          );
        },
      ),
    );
  }

  void _onBookPressed() {
    if (_selectedDate == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BookingConfirmationSheet(
        court: _courts.firstWhere((c) => c.id == _selectedCourt),
        slot: [..._morningSlots, ..._eveningSlots]
            .firstWhere((s) => s.id == _selectedSlot),
        date: _selectedDate!,
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
        width: 85,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
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
              style: AppTypography.labelMedium.copyWith(
                color: isSelected ? AppColors.white : AppColors.textSecondary,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              date.day.toString(),
              style: AppTypography.headlineSmall.copyWith(
                color: isSelected ? AppColors.white : AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            AppSpacing.vGapXxs,
            Text(
              monthNames[date.month - 1],
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
          horizontal: AppSpacing.md,
          vertical: AppSpacing.lg,
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
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              court.name,
              style: AppTypography.displaySmall.copyWith(
                color: isDisabled
                    ? AppColors.neutral400
                    : isSelected
                        ? AppColors.white
                        : AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 36,
              ),
              textAlign: TextAlign.center,
            ),
            if (isDisabled) ...[
              AppSpacing.vGapXs,
              Text(
                'Indisponible',
                style: AppTypography.caption.copyWith(
                  color: AppColors.error,
                  fontSize: 11,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TimeSlotCard extends StatelessWidget {
  const _TimeSlotCard({
    required this.slot,
    required this.isSelected,
    required this.periodIcon,
    this.onTap,
  });

  final TimeSlot slot;
  final bool isSelected;
  final String periodIcon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDisabled = !slot.isAvailable;
    final timeParts = slot.time.split(' - ');
    final startTime = timeParts[0];
    final endTime = timeParts.length > 1 ? timeParts[1] : '';

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationNormal,
        width: 110,
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: isDisabled
              ? AppColors.surfaceSubtle
              : isSelected
                  ? AppColors.brandPrimary
                  : AppColors.surfaceDefault,
          borderRadius: AppRadius.borderRadiusMd,
          border: isSelected || isDisabled
              ? null
              : Border.all(color: AppColors.borderDefault),
          boxShadow: isSelected && !isDisabled
              ? [
                  BoxShadow(
                    color: AppColors.brandPrimary.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Time display
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  startTime,
                  style: AppTypography.titleSmall.copyWith(
                    color: isDisabled
                        ? AppColors.textDisabled
                        : isSelected
                            ? AppColors.white
                            : AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    Icon(
                      Icons.arrow_forward,
                      size: 10,
                      color: isDisabled
                          ? AppColors.textDisabled
                          : isSelected
                              ? AppColors.white.withValues(alpha: 0.7)
                              : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      endTime,
                      style: AppTypography.caption.copyWith(
                        color: isDisabled
                            ? AppColors.textDisabled
                            : isSelected
                                ? AppColors.white.withValues(alpha: 0.8)
                                : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            // Price badge and status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isDisabled
                        ? AppColors.neutral200
                        : isSelected
                            ? AppColors.white.withValues(alpha: 0.2)
                            : AppColors.brandPrimary.withValues(alpha: 0.1),
                    borderRadius: AppRadius.borderRadiusFull,
                  ),
                  child: Text(
                    '${(slot.price / 1000).toStringAsFixed(0)}k F',
                    style: AppTypography.caption.copyWith(
                      color: isDisabled
                          ? AppColors.textDisabled
                          : isSelected
                              ? AppColors.white
                              : AppColors.brandPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 10,
                    ),
                  ),
                ),
                if (isDisabled)
                  Icon(
                    Icons.block,
                    size: 14,
                    color: AppColors.error.withValues(alpha: 0.6),
                  )
                else if (isSelected)
                  Icon(
                    Icons.check_circle,
                    size: 14,
                    color: AppColors.white,
                  )
                else
                  Icon(
                    Icons.radio_button_unchecked,
                    size: 14,
                    color: AppColors.neutral300,
                  ),
              ],
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
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceDefault.withValues(alpha: 0.9),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            border: Border(
              top: BorderSide(color: AppColors.white.withValues(alpha: 0.5), width: 1),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle area
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.neutral300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),

              // Modal Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Text(
                  'Récapitulatif',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              
              const SizedBox(height: 24),

              // Main Content Card
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.neutral200),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(
                      context,
                      icon: Icons.calendar_month_outlined,
                      label: 'Date',
                      value: '${date.day}/${date.month}/${date.year}',
                      iconColor: AppColors.brandSecondary,
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(height: 1, color: AppColors.neutral200),
                    ),
                    _buildInfoRow(
                      context,
                      icon: Icons.access_time_filled_outlined,
                      label: 'Créneau',
                      value: slot.time,
                      iconColor: AppColors.brandPrimary,
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(height: 1, color: AppColors.neutral200),
                    ),
                    _buildInfoRow(
                      context,
                      icon: Icons.sports_tennis_outlined,
                      label: 'Terrain',
                      value: 'Terrain ${court.name}',
                      iconColor: AppColors.success,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Price Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total à payer',
                      style: AppTypography.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      '${slot.price.toStringAsFixed(0)} FCFA',
                      style: AppTypography.headlineMedium.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Action Buttons
              Container(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                child: Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: AppColors.neutral300),
                          ),
                          backgroundColor: Colors.transparent,
                        ),
                        child: Text(
                          'Annuler',
                          style: AppTypography.labelLarge.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.brandPrimary.withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Réservation confirmée avec succès !'),
                                backgroundColor: AppColors.success,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Confirmer',
                                style: AppTypography.labelLarge.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_rounded, color: AppColors.white, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color iconColor,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: AppTypography.titleSmall.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
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

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.isSelected,
    this.onTap,
    this.badgeCount = 0,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final int badgeCount;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationNormal,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandPrimary : Colors.transparent,
          borderRadius: AppRadius.borderRadiusSm,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: AppTypography.labelMedium.copyWith(
                color: isSelected ? AppColors.white : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            if (badgeCount > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected 
                      ? AppColors.white 
                      : AppColors.brandSecondary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badgeCount.toString(),
                  style: AppTypography.caption.copyWith(
                    color: isSelected 
                        ? AppColors.brandPrimary 
                        : AppColors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _BookingHistoryCard extends StatelessWidget {
  const _BookingHistoryCard({
    required this.booking,
    this.isHighlighted = false,
  });

  final Booking booking;
  final bool isHighlighted;

  @override
  Widget build(BuildContext context) {
    final monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    final dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return Container(
      decoration: BoxDecoration(
        color: isHighlighted ? AppColors.white : AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(
          color: isHighlighted 
              ? AppColors.brandSecondary 
              : AppColors.reservationCardBorder,
          width: isHighlighted ? 2 : 1,
        ),
        boxShadow: isHighlighted
            ? [
                BoxShadow(
                  color: AppColors.brandSecondary.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: () {
            // Show booking details
          },
          borderRadius: AppRadius.cardBorderRadius,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                // Date badge
                Container(
                  width: 60,
                  padding: const EdgeInsets.symmetric(
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: booking.status == BookingStatus.upcoming
                        ? AppColors.brandSecondary
                        : booking.status == BookingStatus.cancelled
                            ? AppColors.neutral400
                            : AppColors.brandPrimary,
                    borderRadius: AppRadius.borderRadiusSm,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        dayNames[booking.date.weekday - 1],
                        style: AppTypography.caption.copyWith(
                          color: AppColors.white.withValues(alpha: 0.8),
                        ),
                      ),
                      Text(
                        booking.date.day.toString(),
                        style: AppTypography.titleLarge.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        monthNames[booking.date.month - 1],
                        style: AppTypography.caption.copyWith(
                          color: AppColors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                AppSpacing.hGapMd,

                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary.withValues(alpha: 0.1),
                              borderRadius: AppRadius.borderRadiusSm,
                            ),
                            child: Text(
                              'Terrain ${booking.courtName}',
                              style: AppTypography.labelMedium.copyWith(
                                color: AppColors.brandPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const Spacer(),
                          AppBadge(
                            label: booking.status.label,
                            variant: booking.status.badgeVariant,
                          ),
                        ],
                      ),
                      AppSpacing.vGapSm,
                      Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${booking.startTime} - ${booking.endTime}',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.vGapXxs,
                      Row(
                        children: [
                          Text(
                            '${booking.price.toStringAsFixed(0)} FCFA',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            '  •  ',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textTertiary,
                            ),
                          ),
                          Text(
                            'Réf: ${booking.reference}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Arrow
                Icon(
                  AppIcons.chevronRight,
                  color: AppColors.iconTertiary,
                  size: AppIcons.sizeMd,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

enum BookingStatus {
  upcoming,
  completed,
  cancelled;

  String get label {
    switch (this) {
      case BookingStatus.upcoming:
        return 'À venir';
      case BookingStatus.completed:
        return 'Terminée';
      case BookingStatus.cancelled:
        return 'Annulée';
    }
  }

  AppBadgeVariant get badgeVariant {
    switch (this) {
      case BookingStatus.upcoming:
        return AppBadgeVariant.warning;
      case BookingStatus.completed:
        return AppBadgeVariant.success;
      case BookingStatus.cancelled:
        return AppBadgeVariant.error;
    }
  }
}

class Booking {
  final String reference;
  final String courtName;
  final DateTime date;
  final String startTime;
  final String endTime;
  final double price;
  final BookingStatus status;

  Booking({
    required this.reference,
    required this.courtName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.price,
    required this.status,
  });
}

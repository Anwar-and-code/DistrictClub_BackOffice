import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;
import '../../../core/design_system/design_system.dart';
import '../../gamification/gamification.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({super.key});

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  int _currentTab = 0;
  DateTime? _selectedDate;
  bool _isDateExpanded = true;
  bool _isSlotExpanded = true;
  bool _isCourtExpanded = true;
  String? _selectedCourt;
  String? _selectedSlot;

  final List<Booking> _bookingHistory = [
    // Upcoming
    Booking(
      reference: 'WP-X0123',
      courtName: 'A',
      date: DateTime.now().add(const Duration(days: 3)),
      startTime: '19:00',
      endTime: '20:30',
      price: 25000,
      status: BookingStatus.upcoming,
    ),
    // Yesterday
    Booking(
      reference: 'WP-X0125',
      courtName: 'A',
      date: DateTime.now().subtract(const Duration(days: 1)),
      startTime: '13:00',
      endTime: '14:00',
      price: 15000,
      status: BookingStatus.completed,
    ),
    Booking(
      reference: 'WP-X0126',
      courtName: 'B',
      date: DateTime.now().subtract(const Duration(days: 1)),
      startTime: '16:00',
      endTime: '17:30',
      price: 20000,
      status: BookingStatus.completed,
    ),
    // 3 days ago
    Booking(
      reference: 'WP-X0124',
      courtName: 'D',
      date: DateTime.now().subtract(const Duration(days: 3)),
      startTime: '10:00',
      endTime: '11:00',
      price: 15000,
      status: BookingStatus.completed,
    ),
    // 7 days ago
    Booking(
      reference: 'WP-X0122',
      courtName: 'C',
      date: DateTime.now().subtract(const Duration(days: 7)),
      startTime: '14:00',
      endTime: '15:00',
      price: 15000,
      status: BookingStatus.completed,
    ),
    // 15 days ago
    Booking(
      reference: 'WP-X0121',
      courtName: 'A',
      date: DateTime.now().subtract(const Duration(days: 15)),
      startTime: '18:00',
      endTime: '19:30',
      price: 20000,
      status: BookingStatus.cancelled,
    ),
    Booking(
      reference: 'WP-X0120',
      courtName: 'B',
      date: DateTime.now().subtract(const Duration(days: 15)),
      startTime: '09:00',
      endTime: '10:00',
      price: 10000,
      status: BookingStatus.completed,
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

  final List<TimeSlot> _allSlots = [
    TimeSlot(id: '1', time: '08:00 - 09:00', price: 10000, isAvailable: true),
    TimeSlot(id: '2', time: '09:00 - 10:00', price: 10000, isAvailable: false),
    TimeSlot(id: '3', time: '10:00 - 11:00', price: 10000, isAvailable: true),
    TimeSlot(id: '4', time: '11:00 - 12:00', price: 10000, isAvailable: true),
    TimeSlot(id: '5', time: '12:00 - 13:00', price: 10000, isAvailable: false),
    TimeSlot(id: '6', time: '13:00 - 14:00', price: 10000, isAvailable: true),
    TimeSlot(id: '7', time: '14:00 - 15:00', price: 10000, isAvailable: true),
    TimeSlot(id: '8', time: '15:00 - 16:00', price: 10000, isAvailable: true),
    TimeSlot(id: '9', time: '16:00 - 17:00', price: 15000, isAvailable: true),
    TimeSlot(id: '10', time: '17:00 - 18:00', price: 15000, isAvailable: false),
    TimeSlot(id: '11', time: '18:00 - 19:00', price: 15000, isAvailable: true),
    TimeSlot(id: '12', time: '19:00 - 20:00', price: 20000, isAvailable: true),
    TimeSlot(id: '13', time: '20:00 - 21:00', price: 20000, isAvailable: true),
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
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.borderDefault,
          width: 1,
        ),
      ),
      child: Stack(
        children: [
          // Animated Background Indicator
          AnimatedAlign(
            alignment: _currentTab == 0 ? Alignment.centerLeft : Alignment.centerRight,
            duration: AppAnimations.durationNormal,
            curve: Curves.easeInOutCubic, // Smoother curve for sliding effect
            child: FractionallySizedBox(
              widthFactor: 0.5,
              child: Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandPrimary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Tab Labels
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    if (_currentTab != 0) {
                      setState(() => _currentTab = 0);
                      HapticFeedback.selectionClick();
                    }
                  },
                  behavior: HitTestBehavior.opaque,
                  child: Center(
                    child: AnimatedDefaultTextStyle(
                      duration: AppAnimations.durationNormal,
                      style: AppTypography.labelMedium.copyWith(
                        color: _currentTab == 0 
                            ? AppColors.white 
                            : AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                      child: const Text('Réserver'),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    if (_currentTab != 1) {
                      setState(() => _currentTab = 1);
                      HapticFeedback.selectionClick();
                    }
                  },
                  behavior: HitTestBehavior.opaque,
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedDefaultTextStyle(
                          duration: AppAnimations.durationNormal,
                          style: AppTypography.labelMedium.copyWith(
                            color: _currentTab == 1 
                                ? AppColors.white 
                                : AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                          child: const Text('Historique'),
                        ),
                        if (_upcomingCount > 0) ...[
                          const SizedBox(width: 8),
                          AnimatedContainer(
                            duration: AppAnimations.durationNormal,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8, 
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: _currentTab == 1 
                                  ? AppColors.white 
                                  : AppColors.brandSecondary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _upcomingCount.toString(),
                              style: AppTypography.caption.copyWith(
                                color: _currentTab == 1 
                                    ? AppColors.brandPrimary 
                                    : AppColors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
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
              child: GestureDetector(
                onTap: () {
                  if (!_isSlotExpanded) {
                    setState(() => _isSlotExpanded = true);
                  }
                },
                child: _buildStepHeader(
                  step: 2,
                  title: 'Choisir un créneau',
                  isCompleted: _selectedSlot != null,
                  showEditAction: !_isSlotExpanded,
                ),
              ),
            ),
            AppSpacing.vGapMd,
            AnimatedCrossFade(
              firstChild: _buildTimeSlotList(),
              secondChild: _selectedSlot != null
                  ? _buildSelectedSlotSummary()
                  : const SizedBox.shrink(),
              crossFadeState: _isSlotExpanded
                  ? CrossFadeState.showFirst
                  : CrossFadeState.showSecond,
              duration: AppAnimations.durationNormal,
            ),
          ],

          // Step 3: Court selector (visible after slot selection)
          if (_selectedSlot != null) ...[
            AppSpacing.vGapXl,
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: GestureDetector(
                onTap: () {
                  if (!_isCourtExpanded) {
                    setState(() => _isCourtExpanded = true);
                  }
                },
                child: _buildStepHeader(
                  step: 3,
                  title: 'Choisir un terrain',
                  isCompleted: _selectedCourt != null,
                  showEditAction: !_isCourtExpanded,
                ),
              ),
            ),
            AppSpacing.vGapMd,
            AnimatedCrossFade(
              firstChild: Padding(
                padding: AppSpacing.screenPaddingHorizontalOnly,
                child: _buildCourtSelector(),
              ),
              secondChild: _selectedCourt != null
                  ? _buildSelectedCourtSummary()
                  : const SizedBox.shrink(),
              crossFadeState: _isCourtExpanded
                  ? CrossFadeState.showFirst
                  : CrossFadeState.showSecond,
              duration: AppAnimations.durationNormal,
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

  Widget _buildSelectedSlotSummary() {
    if (_selectedSlot == null) return const SizedBox.shrink();
    
    final slot = _allSlots.firstWhere((s) => s.id == _selectedSlot);
    final timeParts = slot.time.split(' - ');
    final startTime = timeParts[0].replaceAll(':', 'h');
    final endTime = timeParts.length > 1 ? timeParts[1].replaceAll(':', 'h') : '';
    final timeStr = '$startTime - $endTime';

    return GestureDetector(
      onTap: () => setState(() => _isSlotExpanded = true),
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
              Icons.access_time,
              color: AppColors.brandPrimary,
              size: 20,
            ),
            AppSpacing.hGapMd,
            Text(
              timeStr,
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

  Widget _buildSelectedCourtSummary() {
    if (_selectedCourt == null) return const SizedBox.shrink();
    
    final court = _courts.firstWhere((c) => c.id == _selectedCourt);

    return GestureDetector(
      onTap: () => setState(() => _isCourtExpanded = true),
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
              Icons.sports_tennis,
              color: AppColors.brandPrimary,
              size: 20,
            ),
            AppSpacing.hGapMd,
            Text(
              'Terrain ${court.name}',
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

  String _formatDateHeader(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final bookingDate = DateTime(date.year, date.month, date.day);
    
    final monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    if (bookingDate.isAtSameMomentAs(today)) {
      return 'Aujourd\'hui';
    } else if (bookingDate.isAtSameMomentAs(yesterday)) {
      return 'Hier';
    } else {
      return 'le ${date.day.toString().padLeft(2, '0')} ${monthNames[date.month - 1]} ${date.year}';
    }
  }

  Map<String, List<Booking>> _groupBookingsByDate(List<Booking> bookings) {
    final Map<String, List<Booking>> grouped = {};
    for (var booking in bookings) {
      final dateKey = DateTime(booking.date.year, booking.date.month, booking.date.day).toString();
      if (!grouped.containsKey(dateKey)) {
        grouped[dateKey] = [];
      }
      grouped[dateKey]!.add(booking);
    }
    return grouped;
  }

  Widget _buildHistoryTab() {
    // Sort upcoming bookings by date (earliest first)
    final upcomingBookings = _bookingHistory
        .where((b) => b.status == BookingStatus.upcoming)
        .toList()
      ..sort((a, b) => a.date.compareTo(b.date));
    
    // Sort past bookings by date (most recent first)
    final pastBookings = _bookingHistory
        .where((b) => b.status != BookingStatus.upcoming)
        .toList()
      ..sort((a, b) => b.date.compareTo(a.date));
    
    // Group past bookings by date
    final groupedPastBookings = _groupBookingsByDate(pastBookings);
    final sortedDateKeys = groupedPastBookings.keys.toList()
      ..sort((a, b) => DateTime.parse(b).compareTo(DateTime.parse(a)));

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSpacing.vGapLg,
          
          // Upcoming reservations section - clean professional header
          if (upcomingBookings.isNotEmpty) ...[
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Row(
                children: [
                  Text(
                    'À venir',
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandSecondary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${upcomingBookings.length}',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            AppSpacing.vGapMd,
            ...upcomingBookings.map((booking) => Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: _BookingHistoryCard(booking: booking),
              ),
            )),
            AppSpacing.vGapLg,
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
            AppSpacing.vGapLg,
          ],

          // Past reservations - grouped by date with headers
          Padding(
            padding: AppSpacing.screenPaddingHorizontalOnly,
            child: Text(
              'Terminées',
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
            ...sortedDateKeys.expand((dateKey) {
              final date = DateTime.parse(dateKey);
              final bookingsForDate = groupedPastBookings[dateKey]!;
              return [
                // Date header
                Padding(
                  padding: AppSpacing.screenPaddingHorizontalOnly,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Text(
                      _formatDateHeader(date),
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                // Bookings for this date
                ...bookingsForDate.map((booking) => Padding(
                  padding: AppSpacing.screenPaddingHorizontalOnly,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: _BookingHistoryCard(booking: booking),
                  ),
                )),
                // Extra spacing between date groups
                AppSpacing.vGapSm,
              ];
            }),
          
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
                _isDateExpanded = false;
                // Reset downstream selections and expand states when date changes
                _selectedSlot = null;
                _selectedCourt = null;
                _isSlotExpanded = true;
                _isCourtExpanded = true;
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
              ? () {
                  setState(() {
                    _selectedCourt = court.id;
                    _isCourtExpanded = false;
                  });
                }
              : null,
        );
      },
    );
  }

  Widget _buildTimeSlotList() {
    return Container(
      margin: AppSpacing.screenPaddingHorizontalOnly,
      constraints: const BoxConstraints(maxHeight: 280),
      decoration: BoxDecoration(
        color: AppColors.surfaceDefault,
        borderRadius: AppRadius.borderRadiusMd,
        border: Border.all(color: AppColors.borderDefault),
      ),
      child: ClipRRect(
        borderRadius: AppRadius.borderRadiusMd,
        child: ListView.separated(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          itemCount: _allSlots.length,
          separatorBuilder: (context, index) => Divider(
            height: 1,
            color: AppColors.borderDefault,
          ),
          itemBuilder: (context, index) {
            final slot = _allSlots[index];
            final isSelected = _selectedSlot == slot.id;
            return _TimeSlotRow(
              slot: slot,
              isSelected: isSelected,
              onTap: slot.isAvailable
                  ? () {
                      setState(() {
                        _selectedSlot = slot.id;
                        _isSlotExpanded = false;
                        // Reset downstream selections when slot changes
                        _selectedCourt = null;
                        _isCourtExpanded = true;
                      });
                    }
                  : null,
            );
          },
        ),
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
        slot: _allSlots.firstWhere((s) => s.id == _selectedSlot),
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

class _TimeSlotRow extends StatelessWidget {
  const _TimeSlotRow({
    required this.slot,
    required this.isSelected,
    this.onTap,
  });

  final TimeSlot slot;
  final bool isSelected;
  final VoidCallback? onTap;

  String _formatPrice(int price) {
    if (price >= 1000) {
      final thousands = price ~/ 1000;
      final remainder = price % 1000;
      if (remainder == 0) {
        return '$thousands 000 F.CFA';
      }
      return '$thousands ${remainder.toString().padLeft(3, '0')} F.CFA';
    }
    return '$price F.CFA';
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = !slot.isAvailable;
    final timeParts = slot.time.split(' - ');
    final startTime = timeParts[0].replaceAll(':', 'h');
    final endTime = timeParts.length > 1 ? timeParts[1].replaceAll(':', 'h') : '';

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppAnimations.durationFast,
        color: isSelected
            ? AppColors.brandPrimary.withValues(alpha: 0.08)
            : isDisabled
                ? AppColors.neutral50
                : Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          child: Row(
            children: [
              // Time range
              Expanded(
                child: Text(
                  '$startTime - $endTime',
                  style: AppTypography.bodyMedium.copyWith(
                    color: isDisabled
                        ? AppColors.textDisabled
                        : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
              // Price badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: isDisabled
                      ? AppColors.neutral300
                      : isSelected
                          ? AppColors.brandPrimary
                          : AppColors.neutral900,
                  borderRadius: AppRadius.borderRadiusSm,
                ),
                child: Text(
                  _formatPrice(slot.price.toInt()),
                  style: AppTypography.labelMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
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
                            // Close the bottom sheet first
                            Navigator.of(context).pop();
                            
                            // Trigger gamification - the CelebrationOverlay handles all animations
                            // Extract hour from slot for time-based achievements
                            final slotHour = int.tryParse(slot.time.split(':').first) ?? 12;
                            GamificationServiceV2.instance.onReservationMade(hour: slotHour);
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



class _BookingHistoryCard extends StatelessWidget {
  const _BookingHistoryCard({
    required this.booking,
  });

  final Booking booking;

  String _formatDate(DateTime date) {
    final monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return '${date.day} ${monthNames[date.month - 1]} ${date.year}';
  }

  String _formatPrice(double price) {
    final priceInt = price.toInt();
    if (priceInt >= 1000) {
      return '${(priceInt / 1000).toStringAsFixed(priceInt % 1000 == 0 ? 0 : 0)} 000 F';
    }
    return '$priceInt F';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(
          color: AppColors.reservationCardBorder,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: () {
            // Show booking details
          },
          borderRadius: AppRadius.cardBorderRadius,
          child: Row(
            children: [
              // Time badge on the left
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm + 2,
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
                      booking.startTime,
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      booking.endTime,
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
                            'Terrain ${booking.courtName}',
                            style: AppTypography.labelMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            '  •  ${_formatDate(booking.date)}',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.vGapXxs,
                      Text(
                        '${_formatPrice(booking.price)}  •  Réf: ${booking.reference}',
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

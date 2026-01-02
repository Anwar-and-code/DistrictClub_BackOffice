import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        title: const Text(
          'Événements',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Featured event
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: _FeaturedEventCard(
                event: Event(
                  id: '1',
                  title: 'Tournoi Padel Masters',
                  description: 'Participez au plus grand tournoi de la saison',
                  date: 'Sam 15 Jan 2024',
                  time: '09:00 - 18:00',
                  imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
                  participants: 32,
                  maxParticipants: 64,
                  category: 'Tournoi',
                ),
              ),
            ),

            AppSpacing.vGapXl,

            // Upcoming events
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: const AppSectionHeader(
                title: 'Événements à venir',
                action: 'Voir tout',
              ),
            ),
            AppSpacing.vGapMd,

            // Events list
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: AppSpacing.screenPaddingHorizontalOnly,
              itemCount: _upcomingEvents.length,
              separatorBuilder: (_, __) => AppSpacing.vGapMd,
              itemBuilder: (context, index) {
                return _EventCard(event: _upcomingEvents[index]);
              },
            ),

            AppSpacing.vGapXl,

            // Past events
            Padding(
              padding: AppSpacing.screenPaddingHorizontalOnly,
              child: const AppSectionHeader(
                title: 'Événements passés',
              ),
            ),
            AppSpacing.vGapMd,

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: AppSpacing.screenPaddingHorizontalOnly,
              itemCount: 2,
              separatorBuilder: (_, __) => AppSpacing.vGapMd,
              itemBuilder: (context, index) {
                return _EventCard(
                  event: _pastEvents[index],
                  isPast: true,
                );
              },
            ),

            AppSpacing.vGapXxl,
          ],
        ),
      ),
    );
  }
}

final List<Event> _upcomingEvents = [
  Event(
    id: '2',
    title: 'Initiation Padel',
    description: 'Séance découverte pour débutants',
    date: 'Dim 16 Jan 2024',
    time: '10:00 - 12:00',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80',
    participants: 8,
    maxParticipants: 12,
    category: 'Formation',
  ),
  Event(
    id: '3',
    title: 'Soirée Afterwork Padel',
    description: 'Détente entre collègues après le travail',
    date: 'Ven 20 Jan 2024',
    time: '18:00 - 21:00',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80',
    participants: 16,
    maxParticipants: 24,
    category: 'Social',
  ),
  Event(
    id: '4',
    title: 'Championnat Inter-Entreprises',
    description: 'Compétition entre les entreprises de la région',
    date: 'Sam 28 Jan 2024',
    time: '08:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&q=80',
    participants: 48,
    maxParticipants: 64,
    category: 'Tournoi',
  ),
];

final List<Event> _pastEvents = [
  Event(
    id: '5',
    title: 'Tournoi de Noël',
    description: 'Édition spéciale fêtes',
    date: 'Sam 24 Déc 2023',
    time: '09:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    participants: 64,
    maxParticipants: 64,
    category: 'Tournoi',
  ),
  Event(
    id: '6',
    title: 'Cours Collectif Niveau 2',
    description: 'Perfectionnement technique',
    date: 'Dim 18 Déc 2023',
    time: '14:00 - 16:00',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
    participants: 10,
    maxParticipants: 10,
    category: 'Formation',
  ),
];

class _FeaturedEventCard extends StatelessWidget {
  const _FeaturedEventCard({required this.event});

  final Event event;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardBorderRadius,
        boxShadow: AppShadows.shadowMd,
      ),
      child: ClipRRect(
        borderRadius: AppRadius.cardBorderRadius,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background image
            Image.network(
              event.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: AppColors.neutral200,
              ),
            ),

            // Gradient overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppColors.black.withValues(alpha: 0.8),
                  ],
                ),
              ),
            ),

            // Content
            Padding(
              padding: AppSpacing.cardPaddingLargeAll,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category badge
                  AppBadge(
                    label: event.category,
                    variant: AppBadgeVariant.secondary,
                  ),

                  const Spacer(),

                  // Title
                  Text(
                    event.title,
                    style: AppTypography.headlineSmall.copyWith(
                      color: AppColors.white,
                    ),
                  ),
                  AppSpacing.vGapXs,

                  // Date & Time
                  Row(
                    children: [
                      Icon(
                        AppIcons.calendar,
                        size: 16,
                        color: AppColors.white.withValues(alpha: 0.8),
                      ),
                      AppSpacing.hGapXs,
                      Text(
                        '${event.date} • ${event.time}',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.vGapSm,

                  // Progress and CTA
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${event.participants}/${event.maxParticipants} participants',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.white.withValues(alpha: 0.8),
                              ),
                            ),
                            AppSpacing.vGapXxs,
                            ClipRRect(
                              borderRadius: AppRadius.borderRadiusFull,
                              child: LinearProgressIndicator(
                                value: event.participants / event.maxParticipants,
                                backgroundColor: AppColors.white.withValues(alpha: 0.3),
                                valueColor: AlwaysStoppedAnimation(
                                  AppColors.brandSecondary,
                                ),
                                minHeight: 4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      AppSpacing.hGapMd,
                      AppButton(
                        label: "S'inscrire",
                        onPressed: () {},
                        variant: AppButtonVariant.primary,
                        size: AppButtonSize.small,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  const _EventCard({
    required this.event,
    this.isPast = false,
  });

  final Event event;
  final bool isPast;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        boxShadow: AppShadows.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: AppRadius.cardBorderRadius,
        child: InkWell(
          onTap: () {},
          borderRadius: AppRadius.cardBorderRadius,
          child: Padding(
            padding: AppSpacing.cardPaddingAll,
            child: Row(
              children: [
                // Image
                ClipRRect(
                  borderRadius: AppRadius.borderRadiusMd,
                  child: SizedBox(
                    width: 80,
                    height: 80,
                    child: Image.network(
                      event.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: AppColors.neutral200,
                        child: Icon(
                          AppIcons.events,
                          color: AppColors.neutral400,
                        ),
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
                      Row(
                        children: [
                          AppBadge(
                            label: event.category,
                            variant: isPast
                                ? AppBadgeVariant.info
                                : AppBadgeVariant.secondary,
                            size: AppBadgeSize.small,
                          ),
                          if (isPast) ...[
                            AppSpacing.hGapXs,
                            AppBadge(
                              label: 'Terminé',
                              variant: AppBadgeVariant.info,
                              size: AppBadgeSize.small,
                            ),
                          ],
                        ],
                      ),
                      AppSpacing.vGapXs,
                      Text(
                        event.title,
                        style: AppTypography.titleSmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      AppSpacing.vGapXxs,
                      Row(
                        children: [
                          Icon(
                            AppIcons.calendar,
                            size: 14,
                            color: AppColors.iconSecondary,
                          ),
                          AppSpacing.hGapXxs,
                          Expanded(
                            child: Text(
                              event.date,
                              style: AppTypography.caption,
                              maxLines: 1,
                            ),
                          ),
                        ],
                      ),
                      AppSpacing.vGapXxs,
                      Row(
                        children: [
                          Icon(
                            AppIcons.group,
                            size: 14,
                            color: AppColors.iconSecondary,
                          ),
                          AppSpacing.hGapXxs,
                          Text(
                            '${event.participants}/${event.maxParticipants}',
                            style: AppTypography.caption,
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
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class Event {
  final String id;
  final String title;
  final String description;
  final String date;
  final String time;
  final String imageUrl;
  final int participants;
  final int maxParticipants;
  final String category;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.time,
    required this.imageUrl,
    required this.participants,
    required this.maxParticipants,
    required this.category,
  });
}

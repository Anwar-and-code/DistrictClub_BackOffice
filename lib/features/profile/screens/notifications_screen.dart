import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<_NotificationItem> _notifications = [
    _NotificationItem(
      id: '1',
      type: NotificationType.reservation,
      title: 'Réservation confirmée',
      message: 'Votre réservation pour le Terrain A le 8 Jan à 19h00 est confirmée.',
      time: 'Il y a 2 heures',
      isRead: false,
    ),
    _NotificationItem(
      id: '2',
      type: NotificationType.reminder,
      title: 'Rappel de match',
      message: 'Votre match commence dans 2 heures sur le Terrain A.',
      time: 'Il y a 5 heures',
      isRead: false,
    ),
    _NotificationItem(
      id: '3',
      type: NotificationType.social,
      title: 'Nouveau message',
      message: 'Julie Martin vous a envoyé un message dans le salon "Cherche Partenaires".',
      time: 'Hier',
      isRead: true,
    ),
    _NotificationItem(
      id: '4',
      type: NotificationType.tournament,
      title: 'Tournoi à venir',
      message: 'Le Tournoi Amical du Weekend commence dans 2 semaines. Inscrivez-vous !',
      time: 'Hier',
      isRead: true,
    ),
    _NotificationItem(
      id: '5',
      type: NotificationType.promo,
      title: 'Offre spéciale',
      message: '-20% sur votre prochaine réservation avec le code PADEL2026.',
      time: 'Il y a 2 jours',
      isRead: true,
    ),
    _NotificationItem(
      id: '6',
      type: NotificationType.system,
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de PadelHouse est disponible. Mettez à jour pour profiter des dernières fonctionnalités.',
      time: 'Il y a 3 jours',
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

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
          'Notifications',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: Text(
                'Tout lire',
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.brandPrimary,
                ),
              ),
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notification = _notifications[index];
                return _NotificationCard(
                  notification: notification,
                  onTap: () => _handleNotificationTap(notification),
                  onDismiss: () => _dismissNotification(notification),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_outlined,
            size: 64,
            color: AppColors.iconTertiary,
          ),
          AppSpacing.vGapLg,
          Text(
            'Aucune notification',
            style: AppTypography.titleMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          AppSpacing.vGapXs,
          Text(
            'Vous êtes à jour !',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  void _markAllAsRead() {
    setState(() {
      for (var notification in _notifications) {
        notification.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Toutes les notifications marquées comme lues'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _handleNotificationTap(_NotificationItem notification) {
    setState(() {
      notification.isRead = true;
    });

    // Navigate based on notification type
    switch (notification.type) {
      case NotificationType.reservation:
      case NotificationType.reminder:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Redirection vers les réservations...'),
            backgroundColor: AppColors.brandPrimary,
          ),
        );
        break;
      case NotificationType.social:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Redirection vers la communauté...'),
            backgroundColor: AppColors.brandPrimary,
          ),
        );
        break;
      case NotificationType.tournament:
        Navigator.pushNamed(context, '/tournaments');
        break;
      case NotificationType.promo:
        _showPromoDetails(notification);
        break;
      case NotificationType.system:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Vérification des mises à jour...'),
            backgroundColor: AppColors.brandPrimary,
          ),
        );
        break;
    }
  }

  void _showPromoDetails(_NotificationItem notification) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.backgroundPrimary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.local_offer, color: AppColors.warning, size: 40),
            ),
            AppSpacing.vGapLg,
            Text(
              'Code promo',
              style: AppTypography.headlineSmall,
            ),
            AppSpacing.vGapMd,
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.xl,
                vertical: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: AppRadius.borderRadiusMd,
                border: Border.all(
                  color: AppColors.brandPrimary,
                  style: BorderStyle.solid,
                  width: 2,
                ),
              ),
              child: Text(
                'PADEL2026',
                style: AppTypography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.brandPrimary,
                  letterSpacing: 4,
                ),
              ),
            ),
            AppSpacing.vGapMd,
            Text(
              '-20% sur votre prochaine réservation',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            AppSpacing.vGapLg,
            AppButton(
              label: 'Copier le code',
              icon: Icons.copy,
              isFullWidth: true,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Code copié !'),
                    backgroundColor: AppColors.success,
                  ),
                );
              },
            ),
            AppSpacing.vGapLg,
          ],
        ),
      ),
    );
  }

  void _dismissNotification(_NotificationItem notification) {
    setState(() {
      _notifications.remove(notification);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Notification supprimée'),
        backgroundColor: AppColors.textSecondary,
        action: SnackBarAction(
          label: 'Annuler',
          textColor: AppColors.white,
          onPressed: () {
            setState(() {
              _notifications.add(notification);
              _notifications.sort((a, b) => a.id.compareTo(b.id));
            });
          },
        ),
      ),
    );
  }
}

// Notification Types
enum NotificationType {
  reservation,
  reminder,
  social,
  tournament,
  promo,
  system,
}

// Notification Model
class _NotificationItem {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final String time;
  bool isRead;

  _NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.time,
    required this.isRead,
  });
}

// Notification Card Widget
class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.notification,
    required this.onTap,
    required this.onDismiss,
  });

  final _NotificationItem notification;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.lg),
        color: AppColors.error,
        child: Icon(Icons.delete, color: AppColors.white),
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: notification.isRead 
              ? AppColors.cardBackground 
              : AppColors.brandPrimary.withValues(alpha: 0.05),
          borderRadius: AppRadius.cardBorderRadius,
          border: Border.all(
            color: notification.isRead 
                ? AppColors.borderDefault 
                : AppColors.brandPrimary.withValues(alpha: 0.3),
          ),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: AppRadius.cardBorderRadius,
          child: InkWell(
            onTap: onTap,
            borderRadius: AppRadius.cardBorderRadius,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: _getIconColor().withValues(alpha: 0.1),
                      borderRadius: AppRadius.borderRadiusMd,
                    ),
                    child: Icon(
                      _getIcon(),
                      color: _getIconColor(),
                      size: 22,
                    ),
                  ),
                  AppSpacing.hGapMd,

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: AppTypography.labelLarge.copyWith(
                                  fontWeight: notification.isRead 
                                      ? FontWeight.w500 
                                      : FontWeight.bold,
                                ),
                              ),
                            ),
                            if (!notification.isRead)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: AppColors.brandPrimary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        AppSpacing.vGapXxs,
                        Text(
                          notification.message,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        AppSpacing.vGapXs,
                        Text(
                          notification.time,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getIcon() {
    switch (notification.type) {
      case NotificationType.reservation:
        return Icons.calendar_today;
      case NotificationType.reminder:
        return Icons.alarm;
      case NotificationType.social:
        return Icons.chat_bubble;
      case NotificationType.tournament:
        return Icons.emoji_events;
      case NotificationType.promo:
        return Icons.local_offer;
      case NotificationType.system:
        return Icons.system_update;
    }
  }

  Color _getIconColor() {
    switch (notification.type) {
      case NotificationType.reservation:
        return AppColors.brandPrimary;
      case NotificationType.reminder:
        return AppColors.warning;
      case NotificationType.social:
        return AppColors.brandSecondary;
      case NotificationType.tournament:
        return const Color(0xFFEF4444);
      case NotificationType.promo:
        return const Color(0xFFF59E0B);
      case NotificationType.system:
        return AppColors.textSecondary;
    }
  }
}

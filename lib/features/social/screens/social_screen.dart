import 'package:flutter/material.dart';
import '../../../core/design_system/design_system.dart';
import '../../../core/router/page_transitions.dart';

class SocialScreen extends StatefulWidget {
  const SocialScreen({super.key});

  @override
  State<SocialScreen> createState() => _SocialScreenState();
}

class _SocialScreenState extends State<SocialScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundPrimary,
        elevation: 0,
        title: Text(
          'Communauté',
          style: AppTypography.titleLarge,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Header section
          Padding(
            padding: AppSpacing.screenPadding,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Salons de discussion',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                AppSpacing.vGapXs,
                Text(
                  'Rejoignez la communauté et discutez avec d\'autres joueurs',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          
          // Chat rooms list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              itemCount: _chatRooms.length,
              itemBuilder: (context, index) {
                return _ChatRoomCard(
                  chatRoom: _chatRooms[index],
                  onTap: () {
                    context.navigateSlide(
                      _ChatRoomScreen(chatRoom: _chatRooms[index]),
                      routeName: '/social/chat/${_chatRooms[index].id}',
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Chat room card widget
class _ChatRoomCard extends StatelessWidget {
  const _ChatRoomCard({
    required this.chatRoom,
    required this.onTap,
  });

  final ChatRoom chatRoom;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: AppRadius.cardBorderRadius,
        border: Border.all(color: AppColors.borderDefault),
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
              children: [
                // Icon
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: chatRoom.color.withValues(alpha: 0.1),
                    borderRadius: AppRadius.borderRadiusMd,
                  ),
                  child: Icon(
                    chatRoom.icon,
                    color: chatRoom.color,
                    size: 28,
                  ),
                ),
                AppSpacing.hGapMd,
                
                // Room info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              chatRoom.name,
                              style: AppTypography.titleSmall.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (chatRoom.unreadCount > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.brandPrimary,
                                borderRadius: AppRadius.borderRadiusFull,
                              ),
                              child: Text(
                                chatRoom.unreadCount.toString(),
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                      AppSpacing.vGapXxs,
                      Text(
                        chatRoom.description,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      AppSpacing.vGapXxs,
                      Row(
                        children: [
                          Icon(
                            Icons.people,
                            size: 14,
                            color: AppColors.textTertiary,
                          ),
                          AppSpacing.hGapXxs,
                          Text(
                            '${chatRoom.memberCount} membres',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textTertiary,
                            ),
                          ),
                          if (chatRoom.activeCount > 0) ...[
                            AppSpacing.hGapSm,
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: AppColors.success,
                                shape: BoxShape.circle,
                              ),
                            ),
                            AppSpacing.hGapXxs,
                            Text(
                              '${chatRoom.activeCount} en ligne',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.success,
                              ),
                            ),
                          ],
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

// Chat room screen
class _ChatRoomScreen extends StatefulWidget {
  const _ChatRoomScreen({required this.chatRoom});

  final ChatRoom chatRoom;

  @override
  State<_ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<_ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late List<Message> _messages;

  @override
  void initState() {
    super.initState();
    _messages = List.from(_sampleMessages);
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        Message(
          id: DateTime.now().toString(),
          userName: 'Vous',
          text: text,
          time: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          isSentByMe: true,
        ),
      );
    });

    _messageController.clear();
    
    // Scroll to bottom after frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
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
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: widget.chatRoom.color.withValues(alpha: 0.1),
                borderRadius: AppRadius.borderRadiusSm,
              ),
              child: Icon(
                widget.chatRoom.icon,
                color: widget.chatRoom.color,
                size: 20,
              ),
            ),
            AppSpacing.hGapSm,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.chatRoom.name,
                    style: AppTypography.labelLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '${widget.chatRoom.activeCount} en ligne',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(AppIcons.more, color: AppColors.iconPrimary),
            onPressed: () {
              AppComingSoonModal.show(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: AppSpacing.screenPadding,
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _MessageBubble(message: message);
              },
            ),
          ),
          
          // Input bar
          Container(
            padding: EdgeInsets.only(
              left: AppSpacing.md,
              right: AppSpacing.md,
              top: AppSpacing.sm,
              bottom: MediaQuery.of(context).padding.bottom + AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.surfaceDefault,
              border: Border(
                top: BorderSide(
                  color: AppColors.borderDefault,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Tapez un message...',
                      hintStyle: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceSubtle,
                      border: OutlineInputBorder(
                        borderRadius: AppRadius.borderRadiusFull,
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          Icons.attach_file,
                          color: AppColors.iconSecondary,
                        ),
                        onPressed: () {
                          AppComingSoonModal.show(context);
                        },
                      ),
                    ),
                    maxLines: null,
                  ),
                ),
                AppSpacing.hGapSm,
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: Icon(
                      Icons.send,
                      color: AppColors.white,
                    ),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Message bubble widget
class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final Message message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        mainAxisAlignment:
            message.isSentByMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!message.isSentByMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppColors.brandPrimary.withValues(alpha: 0.1),
              child: Text(
                message.userName[0].toUpperCase(),
                style: AppTypography.caption.copyWith(
                  color: AppColors.brandPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            AppSpacing.hGapXs,
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: message.isSentByMe
                    ? AppColors.brandPrimary
                    : AppColors.surfaceSubtle,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(AppRadius.md),
                  topRight: const Radius.circular(AppRadius.md),
                  bottomLeft: Radius.circular(
                    message.isSentByMe ? AppRadius.md : AppRadius.xs,
                  ),
                  bottomRight: Radius.circular(
                    message.isSentByMe ? AppRadius.xs : AppRadius.md,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!message.isSentByMe) ...[
                    Text(
                      message.userName,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.brandPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    AppSpacing.vGapXxs,
                  ],
                  Text(
                    message.text,
                    style: AppTypography.bodyMedium.copyWith(
                      color: message.isSentByMe
                          ? AppColors.white
                          : AppColors.textPrimary,
                    ),
                  ),
                  AppSpacing.vGapXxs,
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        message.time,
                        style: AppTypography.caption.copyWith(
                          color: message.isSentByMe
                              ? AppColors.white.withValues(alpha: 0.7)
                              : AppColors.textTertiary,
                          fontSize: 11,
                        ),
                      ),
                      if (message.isSentByMe) ...[
                        AppSpacing.hGapXxs,
                        Icon(
                          message.isRead ? Icons.done_all : Icons.done,
                          size: 14,
                          color: message.isRead
                              ? AppColors.brandSecondary
                              : AppColors.white.withValues(alpha: 0.7),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Data models
class ChatRoom {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color color;
  final int memberCount;
  final int activeCount;
  final int unreadCount;

  ChatRoom({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
    required this.memberCount,
    required this.activeCount,
    this.unreadCount = 0,
  });
}

class Message {
  final String id;
  final String userName;
  final String text;
  final String time;
  final bool isSentByMe;
  final bool isRead;

  Message({
    required this.id,
    required this.userName,
    required this.text,
    required this.time,
    required this.isSentByMe,
    this.isRead = false,
  });
}

// Sample data - 5 themed global chat rooms for padel community
final List<ChatRoom> _chatRooms = [
  ChatRoom(
    id: '1',
    name: 'Général',
    description: 'Discussion générale et conviviale entre membres',
    icon: Icons.forum,
    color: AppColors.brandPrimary,
    memberCount: 156,
    activeCount: 12,
    unreadCount: 3,
  ),
  ChatRoom(
    id: '2',
    name: 'Cherche Partenaires',
    description: 'Trouve des joueurs pour tes prochaines parties',
    icon: Icons.people_alt,
    color: const Color(0xFF10B981),
    memberCount: 142,
    activeCount: 8,
    unreadCount: 5,
  ),
  ChatRoom(
    id: '3',
    name: 'Conseils & Techniques',
    description: 'Partage tes astuces et améliore ton jeu',
    icon: Icons.lightbulb,
    color: const Color(0xFFF59E0B),
    memberCount: 98,
    activeCount: 6,
    unreadCount: 0,
  ),
  ChatRoom(
    id: '4',
    name: 'Tournois & Événements',
    description: 'Infos sur les compétitions et événements',
    icon: Icons.emoji_events,
    color: const Color(0xFFEF4444),
    memberCount: 124,
    activeCount: 15,
    unreadCount: 2,
  ),
  ChatRoom(
    id: '5',
    name: 'Équipement & Matériel',
    description: 'Discute de raquettes, balles et accessoires',
    icon: Icons.sports_tennis,
    color: const Color(0xFF8B5CF6),
    memberCount: 87,
    activeCount: 4,
    unreadCount: 0,
  ),
];

final List<Message> _sampleMessages = [
  Message(
    id: '1',
    userName: 'Julie Martin',
    text: 'Salut tout le monde ! Quelqu\'un dispo pour un match demain soir ?',
    time: '14:25',
    isSentByMe: false,
  ),
  Message(
    id: '2',
    userName: 'Vous',
    text: 'Oui moi ! Vers quelle heure ?',
    time: '14:28',
    isSentByMe: true,
    isRead: true,
  ),
  Message(
    id: '3',
    userName: 'Julie Martin',
    text: '19h ça vous va ? J\'ai réservé le terrain A',
    time: '14:30',
    isSentByMe: false,
  ),
  Message(
    id: '4',
    userName: 'Marc Dubois',
    text: 'Je peux venir aussi si vous cherchez un 4ème !',
    time: '14:31',
    isSentByMe: false,
  ),
  Message(
    id: '5',
    userName: 'Vous',
    text: 'Parfait ! À demain alors 😊',
    time: '14:32',
    isSentByMe: true,
    isRead: false,
  ),
];

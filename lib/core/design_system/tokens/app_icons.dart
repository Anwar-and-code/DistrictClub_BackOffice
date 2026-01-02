import 'package:flutter/material.dart';

/// Design tokens for icons - PadelHouse Design System
/// Defines icon sizes and common icon mappings
abstract final class AppIcons {
  // ==========================================================================
  // ICON SIZES
  // ==========================================================================
  
  /// 12px - Extra small (badges, indicators)
  static const double sizeXs = 12.0;
  
  /// 16px - Small (inline icons, small buttons)
  static const double sizeSm = 16.0;
  
  /// 20px - Medium small
  static const double sizeMd = 20.0;
  
  /// 24px - Default size (most UI icons)
  static const double sizeDefault = 24.0;
  
  /// 28px - Large
  static const double sizeLg = 28.0;
  
  /// 32px - Extra large (prominent icons)
  static const double sizeXl = 32.0;
  
  /// 40px - Huge (feature icons)
  static const double sizeXxl = 40.0;
  
  /// 48px - Display size
  static const double sizeDisplay = 48.0;
  
  /// 64px - Hero icons
  static const double sizeHero = 64.0;

  // ==========================================================================
  // SEMANTIC ICON SIZES
  // ==========================================================================
  
  /// Icon size for buttons
  static const double buttonIcon = sizeMd;
  
  /// Icon size for navigation bar
  static const double navBarIcon = sizeDefault;
  
  /// Icon size for app bar actions
  static const double appBarIcon = sizeDefault;
  
  /// Icon size for input fields
  static const double inputIcon = sizeMd;
  
  /// Icon size for list items
  static const double listItemIcon = sizeDefault;
  
  /// Icon size for cards
  static const double cardIcon = sizeXl;
  
  /// Icon size for empty states
  static const double emptyStateIcon = sizeHero;

  // ==========================================================================
  // APP-SPECIFIC ICONS (Material Icons mappings)
  // ==========================================================================
  
  // --- Navigation ---
  static const IconData home = Icons.home_outlined;
  static const IconData homeFilled = Icons.home;
  static const IconData reservation = Icons.calendar_today_outlined;
  static const IconData reservationFilled = Icons.calendar_today;
  static const IconData events = Icons.event_outlined;
  static const IconData eventsFilled = Icons.event;
  static const IconData contact = Icons.contact_support_outlined;
  static const IconData contactFilled = Icons.contact_support;
  static const IconData profile = Icons.person_outlined;
  static const IconData profileFilled = Icons.person;
  
  // --- Actions ---
  static const IconData add = Icons.add;
  static const IconData remove = Icons.remove;
  static const IconData close = Icons.close;
  static const IconData check = Icons.check;
  static const IconData edit = Icons.edit_outlined;
  static const IconData delete = Icons.delete_outlined;
  static const IconData share = Icons.share_outlined;
  static const IconData search = Icons.search;
  static const IconData filter = Icons.filter_list;
  static const IconData sort = Icons.sort;
  static const IconData more = Icons.more_vert;
  static const IconData moreHorizontal = Icons.more_horiz;
  static const IconData settings = Icons.settings_outlined;
  static const IconData refresh = Icons.refresh;
  
  // --- Navigation Arrows ---
  static const IconData arrowBack = Icons.arrow_back_ios;
  static const IconData arrowForward = Icons.arrow_forward_ios;
  static const IconData arrowUp = Icons.keyboard_arrow_up;
  static const IconData arrowDown = Icons.keyboard_arrow_down;
  static const IconData chevronRight = Icons.chevron_right;
  static const IconData chevronLeft = Icons.chevron_left;
  
  // --- Status & Feedback ---
  static const IconData success = Icons.check_circle_outlined;
  static const IconData successFilled = Icons.check_circle;
  static const IconData warning = Icons.warning_amber_outlined;
  static const IconData warningFilled = Icons.warning_amber;
  static const IconData error = Icons.error_outlined;
  static const IconData errorFilled = Icons.error;
  static const IconData info = Icons.info_outlined;
  static const IconData infoFilled = Icons.info;
  
  // --- Communication ---
  static const IconData notification = Icons.notifications_outlined;
  static const IconData notificationFilled = Icons.notifications;
  static const IconData notificationActive = Icons.notifications_active_outlined;
  static const IconData message = Icons.message_outlined;
  static const IconData messageFilled = Icons.message;
  static const IconData phone = Icons.phone_outlined;
  static const IconData phoneFilled = Icons.phone;
  static const IconData email = Icons.email_outlined;
  static const IconData emailFilled = Icons.email;
  
  // --- Padel/Sports Specific ---
  static const IconData court = Icons.sports_tennis;
  static const IconData sportsTennis = Icons.sports_tennis;
  static const IconData timer = Icons.timer_outlined;
  static const IconData schedule = Icons.schedule;
  static const IconData trophy = Icons.emoji_events_outlined;
  static const IconData trophyFilled = Icons.emoji_events;
  static const IconData group = Icons.group_outlined;
  static const IconData groupFilled = Icons.group;
  
  // --- Media ---
  static const IconData camera = Icons.camera_alt_outlined;
  static const IconData cameraFilled = Icons.camera_alt;
  static const IconData image = Icons.image_outlined;
  static const IconData imageFilled = Icons.image;
  static const IconData playCircle = Icons.play_circle_outlined;
  static const IconData playCircleFilled = Icons.play_circle;
  static const IconData replay = Icons.replay;
  
  // --- Location & Map ---
  static const IconData location = Icons.location_on_outlined;
  static const IconData locationFilled = Icons.location_on;
  static const IconData map = Icons.map_outlined;
  static const IconData mapFilled = Icons.map;
  
  // --- Time & Date ---
  static const IconData calendar = Icons.calendar_month_outlined;
  static const IconData calendarFilled = Icons.calendar_month;
  static const IconData clock = Icons.access_time;
  static const IconData history = Icons.history;
  
  // --- User & Auth ---
  static const IconData login = Icons.login;
  static const IconData logout = Icons.logout;
  static const IconData visibility = Icons.visibility_outlined;
  static const IconData visibilityOff = Icons.visibility_off_outlined;
  static const IconData lock = Icons.lock_outlined;
  static const IconData lockFilled = Icons.lock;
  
  // --- Misc ---
  static const IconData star = Icons.star_outline;
  static const IconData starFilled = Icons.star;
  static const IconData favorite = Icons.favorite_outline;
  static const IconData favoriteFilled = Icons.favorite;
  static const IconData bookmark = Icons.bookmark_outline;
  static const IconData bookmarkFilled = Icons.bookmark;
  static const IconData help = Icons.help_outline;
  static const IconData helpFilled = Icons.help;
}

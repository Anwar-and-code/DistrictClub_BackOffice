import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

/// Design tokens for icons - PadelHouse Design System
/// Uses Phosphor Icons for a modern, consistent, flexible icon set
/// Phosphor offers multiple weights: thin, light, regular, bold, fill, duotone
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
  // APP-SPECIFIC ICONS (Phosphor Icons - modern, flexible)
  // ==========================================================================
  
  // --- Navigation ---
  static const IconData home = PhosphorIconsRegular.house;
  static const IconData homeFilled = PhosphorIconsFill.house;
  static const IconData reservation = PhosphorIconsRegular.calendarBlank;
  static const IconData reservationFilled = PhosphorIconsFill.calendarBlank;
  static const IconData events = PhosphorIconsRegular.calendarStar;
  static const IconData eventsFilled = PhosphorIconsFill.calendarStar;
  static const IconData contact = PhosphorIconsRegular.chatCircle;
  static const IconData contactFilled = PhosphorIconsFill.chatCircle;
  static const IconData profile = PhosphorIconsRegular.user;
  static const IconData profileFilled = PhosphorIconsFill.user;
  
  // --- Actions ---
  static const IconData add = PhosphorIconsRegular.plus;
  static const IconData remove = PhosphorIconsRegular.minus;
  static const IconData close = PhosphorIconsRegular.x;
  static const IconData check = PhosphorIconsRegular.check;
  static const IconData edit = PhosphorIconsRegular.pencilSimple;
  static const IconData delete = PhosphorIconsRegular.trash;
  static const IconData share = PhosphorIconsRegular.shareNetwork;
  static const IconData search = PhosphorIconsRegular.magnifyingGlass;
  static const IconData filter = PhosphorIconsRegular.funnel;
  static const IconData sort = PhosphorIconsRegular.sortAscending;
  static const IconData more = PhosphorIconsRegular.dotsThreeVertical;
  static const IconData moreHorizontal = PhosphorIconsRegular.dotsThree;
  static const IconData settings = PhosphorIconsRegular.gear;
  static const IconData refresh = PhosphorIconsRegular.arrowClockwise;
  
  // --- Navigation Arrows ---
  static const IconData arrowBack = PhosphorIconsRegular.caretLeft;
  static const IconData arrowForward = PhosphorIconsRegular.caretRight;
  static const IconData arrowUp = PhosphorIconsRegular.caretUp;
  static const IconData arrowDown = PhosphorIconsRegular.caretDown;
  static const IconData chevronRight = PhosphorIconsRegular.caretRight;
  static const IconData chevronLeft = PhosphorIconsRegular.caretLeft;
  
  // --- Status & Feedback ---
  static const IconData success = PhosphorIconsRegular.checkCircle;
  static const IconData successFilled = PhosphorIconsFill.checkCircle;
  static const IconData warning = PhosphorIconsRegular.warning;
  static const IconData warningFilled = PhosphorIconsFill.warning;
  static const IconData error = PhosphorIconsRegular.xCircle;
  static const IconData errorFilled = PhosphorIconsFill.xCircle;
  static const IconData info = PhosphorIconsRegular.info;
  static const IconData infoFilled = PhosphorIconsFill.info;
  
  // --- Communication ---
  static const IconData notification = PhosphorIconsRegular.bell;
  static const IconData notificationFilled = PhosphorIconsFill.bell;
  static const IconData notificationActive = PhosphorIconsRegular.bellRinging;
  static const IconData message = PhosphorIconsRegular.chatTeardrop;
  static const IconData messageFilled = PhosphorIconsFill.chatTeardrop;
  static const IconData phone = PhosphorIconsRegular.phone;
  static const IconData phoneFilled = PhosphorIconsFill.phone;
  static const IconData email = PhosphorIconsRegular.envelope;
  static const IconData emailFilled = PhosphorIconsFill.envelope;
  
  // --- Padel/Sports Specific ---
  static const IconData court = PhosphorIconsRegular.courtBasketball;
  static const IconData sportsTennis = PhosphorIconsRegular.racquet;
  static const IconData timer = PhosphorIconsRegular.timer;
  static const IconData schedule = PhosphorIconsRegular.clockCountdown;
  static const IconData trophy = PhosphorIconsRegular.trophy;
  static const IconData trophyFilled = PhosphorIconsFill.trophy;
  static const IconData group = PhosphorIconsRegular.usersThree;
  static const IconData groupFilled = PhosphorIconsFill.usersThree;
  static const IconData coaching = PhosphorIconsRegular.chalkboardTeacher;
  static const IconData coachingFilled = PhosphorIconsFill.chalkboardTeacher;
  
  // --- Media ---
  static const IconData camera = PhosphorIconsRegular.camera;
  static const IconData cameraFilled = PhosphorIconsFill.camera;
  static const IconData image = PhosphorIconsRegular.image;
  static const IconData imageFilled = PhosphorIconsFill.image;
  static const IconData playCircle = PhosphorIconsRegular.playCircle;
  static const IconData playCircleFilled = PhosphorIconsFill.playCircle;
  static const IconData replay = PhosphorIconsRegular.arrowCounterClockwise;
  
  // --- Location & Map ---
  static const IconData location = PhosphorIconsRegular.mapPin;
  static const IconData locationFilled = PhosphorIconsFill.mapPin;
  static const IconData map = PhosphorIconsRegular.mapTrifold;
  static const IconData mapFilled = PhosphorIconsFill.mapTrifold;
  
  // --- Time & Date ---
  static const IconData calendar = PhosphorIconsRegular.calendar;
  static const IconData calendarFilled = PhosphorIconsFill.calendar;
  static const IconData clock = PhosphorIconsRegular.clock;
  static const IconData history = PhosphorIconsRegular.clockCounterClockwise;
  
  // --- User & Auth ---
  static const IconData login = PhosphorIconsRegular.signIn;
  static const IconData logout = PhosphorIconsRegular.signOut;
  static const IconData visibility = PhosphorIconsRegular.eye;
  static const IconData visibilityOff = PhosphorIconsRegular.eyeSlash;
  static const IconData lock = PhosphorIconsRegular.lock;
  static const IconData lockFilled = PhosphorIconsFill.lock;
  
  // --- Misc ---
  static const IconData star = PhosphorIconsRegular.star;
  static const IconData starFilled = PhosphorIconsFill.star;
  static const IconData favorite = PhosphorIconsRegular.heart;
  static const IconData favoriteFilled = PhosphorIconsFill.heart;
  static const IconData bookmark = PhosphorIconsRegular.bookmarkSimple;
  static const IconData bookmarkFilled = PhosphorIconsFill.bookmarkSimple;
  static const IconData help = PhosphorIconsRegular.question;
  static const IconData helpFilled = PhosphorIconsFill.question;
}

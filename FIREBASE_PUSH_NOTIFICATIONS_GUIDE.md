# Firebase Push Notifications - Guide de Configuration A-Z

## Architecture

```
Mobile App (joueurs) ──> Enregistre FCM Token ──> Supabase (fcm_tokens table)
                                                           │
Backoffice / DB Triggers / Cron ──> Edge Function ──> Firebase Cloud Messaging ──> Push
```

### Cas d'utilisation
| Type | Déclencheur | Cible |
|------|------------|-------|
| Réservation confirmée | Trigger DB automatique (status → CONFIRMED) | Le joueur concerné |
| Rappel 2h avant | Cron job toutes les 15 min | Le joueur concerné |
| Événement publié | Trigger DB automatique (status → PUBLISHED) | Tous les joueurs |
| Notification custom | Envoi manuel depuis le backoffice | Tous / Sélection |

---

## Étape 1 : Créer le projet Firebase

1. Aller sur **https://console.firebase.google.com**
2. Cliquer **"Ajouter un projet"** → Nommer `PadelHouse`
3. Désactiver Google Analytics (optionnel) → **Créer le projet**
4. **Ajouter votre app mobile** :
   - **Android** : Cliquer l'icône Android → Package name : `com.armasoft.padelhouse`
   - **iOS** : Cliquer l'icône iOS → Bundle ID : `com.armasoft.padelhouse`
5. Télécharger les fichiers de config :
   - Android : `google-services.json` → placer dans `android/app/`
   - iOS : `GoogleService-Info.plist` → placer dans le projet Xcode

---

## Étape 2 : Générer la clé de service Firebase (Service Account)

1. Dans Firebase Console → **⚙️ Project Settings → Service Accounts**
2. Cliquer **"Generate new private key"**
3. Télécharger le fichier JSON (ex: `padelhouse-firebase-adminsdk-xxx.json`)
4. **Ouvrir le fichier** → Copier tout le contenu JSON

---

## Étape 3 : Stocker la clé dans Supabase Secrets

### Via le Dashboard Supabase :
1. Aller sur **https://supabase.com/dashboard/project/vslisxnahktqaifdurcu/settings/vault/secrets**
2. Ou bien : **Project Settings → Edge Functions → Secrets**
3. Ajouter un nouveau secret :
   - **Nom** : `FIREBASE_SERVICE_ACCOUNT`
   - **Valeur** : Coller le contenu COMPLET du fichier JSON du service account
4. Sauvegarder

### Vérification :
Le secret sera automatiquement disponible dans les Edge Functions via :
```typescript
Deno.env.get("FIREBASE_SERVICE_ACCOUNT")
```

---

## Étape 4 : Configurer le Cron Job (service_role_key)

Le cron job de rappel utilise `current_setting('app.settings.service_role_key')`.
Vous devez configurer cette variable dans Supabase :

1. Aller dans **SQL Editor** du Dashboard Supabase
2. Exécuter :
```sql
ALTER DATABASE postgres SET app.settings.service_role_key = 'VOTRE_SERVICE_ROLE_KEY';
```

> ⚠️ Remplacez `VOTRE_SERVICE_ROLE_KEY` par votre vraie clé service_role.
> Trouvez-la dans : **Project Settings → API → service_role key (secret)**

---

## Étape 5 : Intégration côté App Mobile Flutter

### 5.1 — Ajouter les dépendances

```yaml
# pubspec.yaml — ajouter dans dependencies:
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^18.0.0  # Pour afficher les notifs en foreground
```

Puis exécuter :
```bash
flutter pub get
```

### 5.2 — Configuration Android

Fichier `android/app/build.gradle` — vérifier que vous avez :
```groovy
plugins {
    id 'com.google.gms.google-services'  // Ajouter cette ligne
}
```

Fichier `android/build.gradle` — ajouter dans `buildscript.dependencies` :
```groovy
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

Fichier `android/app/src/main/AndroidManifest.xml` — ajouter dans `<application>` :
```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="padelhouse_notifications" />

<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@mipmap/ic_launcher" />
```

> ✅ Vérifiez que `google-services.json` est dans `android/app/`

### 5.3 — Configuration iOS

Fichier `ios/Podfile` — vérifier la version minimum :
```ruby
platform :ios, '14.0'
```

Puis :
```bash
cd ios && pod install && cd ..
```

> ✅ Vérifiez que `GoogleService-Info.plist` est dans `ios/Runner/` (ajouté via Xcode)
> ✅ Dans Xcode : Target → Signing & Capabilities → + Push Notifications + Background Modes (Remote notifications)

### 5.4 — Créer le service de notifications (copier-coller)

Créer le fichier `lib/services/push_notification_service.dart` :

```dart
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Handler pour les messages en background (doit être top-level)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('[FCM] Background message: ${message.notification?.title}');
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final _messaging = FirebaseMessaging.instance;
  final _localNotifications = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  // Callback pour naviguer quand on tap une notification
  Function(Map<String, dynamic> data)? onNotificationTap;

  /// Appeler une seule fois au démarrage de l'app (après Firebase.initializeApp)
  Future<void> initialize({
    Function(Map<String, dynamic> data)? onTap,
  }) async {
    if (_initialized) return;
    _initialized = true;
    onNotificationTap = onTap;

    // Enregistrer le handler background
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Configurer les notifications locales (pour afficher en foreground)
    await _setupLocalNotifications();

    // Demander la permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      // Récupérer et sauvegarder le token FCM
      final token = await _messaging.getToken();
      if (token != null) {
        await _saveTokenToSupabase(token);
      }

      // Écouter les changements de token (rotation automatique)
      _messaging.onTokenRefresh.listen(_saveTokenToSupabase);
    }

    // --- Écouter les notifications ---

    // 1. App en FOREGROUND → afficher une notification locale
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // 2. App en BACKGROUND → tap sur la notification
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // 3. App TERMINÉE → vérifier si lancée via une notification
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  /// Configurer flutter_local_notifications
  Future<void> _setupLocalNotifications() async {
    const androidChannel = AndroidNotificationChannel(
      'padelhouse_notifications',
      'PadelHouse Notifications',
      description: 'Notifications de PadelHouse',
      importance: Importance.high,
    );

    // Créer le channel Android
    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);

    const initAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initIOS = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _localNotifications.initialize(
      const InitializationSettings(android: initAndroid, iOS: initIOS),
      onDidReceiveNotificationResponse: (response) {
        // Quand l'utilisateur tap la notification locale
        // On peut passer des données via le payload
        if (response.payload != null) {
          // Parse le payload si nécessaire
        }
      },
    );
  }

  /// Afficher la notification quand l'app est au premier plan
  void _handleForegroundMessage(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'padelhouse_notifications',
          'PadelHouse Notifications',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }

  /// Naviguer quand l'utilisateur tap une notification
  void _handleNotificationTap(RemoteMessage message) {
    if (onNotificationTap != null) {
      onNotificationTap!(message.data);
    }
  }

  /// Sauvegarder le token FCM dans Supabase
  Future<void> _saveTokenToSupabase(String token) async {
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId == null) return;

      await Supabase.instance.client.from('fcm_tokens').upsert(
        {
          'user_id': userId,
          'token': token,
          'device_type': Platform.isIOS ? 'ios' : 'android',
          'device_name': '${Platform.isIOS ? 'iPhone' : 'Android'}',
          'is_active': true,
          'updated_at': DateTime.now().toUtc().toIso8601String(),
        },
        onConflict: 'user_id,token',
      );
      print('[FCM] Token saved to Supabase');
    } catch (e) {
      print('[FCM] Error saving token: $e');
    }
  }

  /// Appeler après la connexion de l'utilisateur pour enregistrer/réenregistrer le token
  Future<void> registerAfterLogin() async {
    final token = await _messaging.getToken();
    if (token != null) {
      await _saveTokenToSupabase(token);
    }
  }

  /// Appeler à la déconnexion pour désactiver le token
  Future<void> unregisterOnLogout() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        await Supabase.instance.client
            .from('fcm_tokens')
            .update({'is_active': false, 'updated_at': DateTime.now().toUtc().toIso8601String()})
            .eq('token', token);
        print('[FCM] Token deactivated');
      }
    } catch (e) {
      print('[FCM] Error deactivating token: $e');
    }
  }
}
```

### 5.5 — Initialiser dans main.dart

```dart
import 'package:firebase_core/firebase_core.dart';
import 'services/push_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser Firebase
  await Firebase.initializeApp();
  
  // Initialiser Supabase (votre code existant)
  await Supabase.initialize(
    url: 'https://vslisxnahktqaifdurcu.supabase.co',
    anonKey: 'votre_anon_key',
  );
  
  // Initialiser les Push Notifications
  await PushNotificationService().initialize(
    onTap: (data) {
      // Naviguer selon le type de notification
      if (data.containsKey('reservation_id')) {
        // navigatorKey.currentState?.pushNamed('/reservation', arguments: data['reservation_id']);
      } else if (data.containsKey('event_id')) {
        // navigatorKey.currentState?.pushNamed('/event', arguments: data['event_id']);
      }
    },
  );
  
  runApp(const MyApp());
}
```

### 5.6 — Appeler après login/logout

```dart
// Après une connexion réussie :
await PushNotificationService().registerAfterLogin();

// Avant/après la déconnexion :
await PushNotificationService().unregisterOnLogout();
await Supabase.instance.client.auth.signOut();
```

### 5.7 — Résumé des fichiers modifiés

| Fichier | Action |
|---------|--------|
| `pubspec.yaml` | Ajouter `firebase_core`, `firebase_messaging`, `flutter_local_notifications` |
| `android/app/google-services.json` | Copier depuis Firebase Console |
| `android/app/build.gradle` | Ajouter plugin `google-services` |
| `android/build.gradle` | Ajouter classpath `google-services` |
| `android/app/src/main/AndroidManifest.xml` | Ajouter meta-data notification channel |
| `ios/Runner/GoogleService-Info.plist` | Copier depuis Firebase Console (via Xcode) |
| `lib/services/push_notification_service.dart` | **NOUVEAU** — Service complet (copier section 5.4) |
| `lib/main.dart` | Ajouter initialisation (section 5.5) |
| Login page | Ajouter `registerAfterLogin()` (section 5.6) |
| Logout | Ajouter `unregisterOnLogout()` (section 5.6) |

---

## Étape 6 : Configuration iOS supplémentaire

Pour iOS, vous devez aussi :

1. **Activer Push Notifications** dans Xcode :
   - Target → Signing & Capabilities → + Capability → Push Notifications
   - + Capability → Background Modes → cocher "Remote notifications"

2. **Uploader la clé APNs dans Firebase** :
   - Apple Developer Console → Certificates, Identifiers & Profiles → Keys
   - Créer une clé avec "Apple Push Notifications service (APNs)"
   - Télécharger le fichier `.p8`
   - Firebase Console → Project Settings → Cloud Messaging → iOS
   - Uploader la clé APNs (.p8)

---

## Ce qui a été mis en place (résumé)

### Base de données
- **`fcm_tokens`** : Stocke les tokens FCM des joueurs (user_id, token, device_type, is_active)
- **`notification_logs`** : Historique de toutes les notifications envoyées

### Edge Functions (Supabase)
- **`send-push-notification`** : Fonction principale qui envoie les notifications via FCM v1 API
  - Supporte : single, multiple, all (tous les joueurs)
  - Désactive automatiquement les tokens invalides
  - Log chaque envoi dans `notification_logs`
- **`reservation-reminder`** : Fonction cron qui cherche les réservations dans 2h et envoie un rappel

### Triggers automatiques (Database)
- **`trg_notify_reservation_confirmed`** : Se déclenche quand `reservations.status` → `CONFIRMED`
- **`trg_notify_event_published`** : Se déclenche quand `events.status` → `PUBLISHED`

### Cron Job
- **`reservation-reminder-job`** : Exécuté toutes les 15 minutes via `pg_cron`

### Backoffice
- **Page `/notifications`** : Interface pour envoyer des notifications custom + voir l'historique
- **Service `notifications.ts`** : API client pour les Edge Functions
- **Sidebar** : Lien "Notifications" ajouté dans la section Administration

---

## Vérification / Debug

### Vérifier les cron jobs actifs :
```sql
SELECT * FROM cron.job;
```

### Vérifier les logs des cron jobs :
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Vérifier les tokens FCM enregistrés :
```sql
SELECT * FROM public.fcm_tokens WHERE is_active = true;
```

### Vérifier l'historique des notifications :
```sql
SELECT * FROM public.notification_logs ORDER BY created_at DESC LIMIT 20;
```

### Tester manuellement l'Edge Function :
```bash
curl -X POST 'https://vslisxnahktqaifdurcu.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer VOTRE_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "custom",
    "title": "Test Notification",
    "body": "Ceci est un test !",
    "target_type": "all",
    "sent_by": "test_curl"
  }'
```

---

## Checklist finale

- [ ] Projet Firebase créé
- [ ] App Android/iOS ajoutée dans Firebase
- [ ] `google-services.json` / `GoogleService-Info.plist` ajouté à l'app mobile
- [ ] Service Account JSON généré
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` configuré dans Supabase
- [ ] `app.settings.service_role_key` configuré dans la base Postgres
- [ ] Code d'enregistrement FCM token intégré dans l'app mobile
- [ ] APNs key uploadée dans Firebase (pour iOS)
- [ ] Test d'envoi depuis le backoffice `/notifications`

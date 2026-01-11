# 🎾 PadelHouse — Application de réservation de padel

PadelHouse est une **application mobile et web** permettant la **réservation de terrains de padel** pour un club disposant de plusieurs terrains et de créneaux horaires dynamiques.  
La solution est conçue pour être **intuitive pour les joueurs**, **efficace pour les gestionnaires**, et **scalable dès la V1**.

---

## 🎯 Objectifs du projets

- Digitaliser la réservation des terrains  
- Éviter les doubles réservations  
- Offrir une visibilité en temps réel sur les créneaux  
- Centraliser la gestion du club (terrains, horaires, événements)  
- Proposer une expérience utilisateur fluide et moderne  

---

## 🧩 Périmètre fonctionnel

### 🎾 Terrains
- 4 terrains : **A, B, C, D**

### ⏱️ Créneaux horaires
- **08h00 → 16h00** : créneaux de **1 heure**
- **16h00 → 23h30** : créneaux de **1h30**

> Les règles de créneaux sont **configurables depuis le back-office**.

---

## 📱 Applications

### 1️⃣ Application mobile (Flutter)
- iOS & Android
- Deux profils :
  - **Public (joueur)**
  - **Gestionnaire**

#### Navigation principale
- **Accueil**
  - Bannière publicitaire / spot
  - Annonces & mises en avant
- **Réservations**
  - Sélection date / terrain
  - Visualisation des créneaux disponibles
  - Réservation rapide
- **Événements**
  - Tournois
  - Animations
  - Inscriptions
- **Social**
  - Actualités du club
  - Photos
  - Résultats
  - Publications internes

---

### 2️⃣ Back-office web (Gestionnaire)
- Tableau de bord administratif
- Gestion :
  - Terrains
  - Créneaux
  - Réservations
  - Utilisateurs
  - Événements
  - Bannières publicitaires
- Vue planning globale
- Statistiques & suivi d’activité

---

## 🧑‍💼 Profils utilisateurs

### 👤 Joueur (Public)
- Inscription / connexion
- Consultation des disponibilités
- Réservation de créneaux
- Historique des réservations
- Annulation selon règles du club
- Notifications (push)

### 🛠️ Gestionnaire
- Accès back-office sécurisé
- Pilotage complet du planning
- Création et gestion d’événements
- Gestion des contenus (bannières, annonces)
- Analyse de l’occupation des terrains

---

## 🧠 Architecture technique

### 📱 Frontend mobile
- **Flutter**
- Architecture : Clean Architecture / MVVM
- State management : Riverpod ou Bloc
- Communication via API REST

### 🌐 Backend API
- **Node.js**
- Framework : Express ou Fastify
- API REST sécurisée
- Authentification JWT
- Gestion des rôles & permissions

### 🗄️ Base de données
- **MySQL**
- Transactions pour la réservation
- Verrouillage logique des créneaux
- Indexation pour éviter toute double réservation

---

## 🔐 Sécurité & fiabilité

- JWT + Refresh Token
- Validation serveur systématique
- Transactions atomiques sur les réservations
- Protection contre les doubles bookings
- Rate limiting API
- Logs & monitoring

---

## 🚀 Scalabilité & évolutivité

- Ajout du paiement en ligne
- Gestion multi-clubs
- Intégration future avec d’autres plateformes
- Déploiement cloud (Docker-ready)

---

## 🛣️ Roadmap

### ✅ V1 – MVP
- Réservation terrains
- Gestion créneaux
- Profils utilisateurs
- Back-office basique
- Événements simples

### 🔄 V2
- Paiement en ligne
- Notifications avancées
- Statistiques détaillées
- Amélioration module Social

### 🚀 V3
- Multi-clubs
- Programmes de fidélité
- Sponsoring & publicité avancée
- Intégration partenaires

---

## 🧩 Philosophie

> **Simple pour l’utilisateur. Solide pour le système. Prêt pour la croissance.**

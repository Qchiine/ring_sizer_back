# Ring Sizer - Frontend Flutter

Application mobile Flutter pour calculer la taille des bagues et gérer un catalogue de produits en or.

## Structure du projet

- `lib/` - Code source Dart principal
  - `models/` - Modèles de données
  - `screens/` - Écrans de l'application
  - `services/` - Services API et authentification
- `android/` - Configuration Android
- `ios/` - Configuration iOS
- `web/` - Configuration Web
- `windows/` - Configuration Windows
- `linux/` - Configuration Linux
- `macos/` - Configuration macOS

## Prérequis

- Flutter SDK (dernière version stable)
- Dart SDK
- Android Studio / Xcode (pour le développement mobile)

## Installation

1. Installer Flutter : https://flutter.dev/docs/get-started/install

2. Installer les dépendances :
```bash
flutter pub get
```

3. Lancer l'application :
```bash
flutter run
```

## Configuration

L'application se connecte au backend via l'API définie dans `lib/services/api_service.dart`.

Par défaut, l'URL de base est : `http://10.0.2.2:5000/api` (pour l'émulateur Android)

Pour changer l'URL du backend, modifiez la constante `baseUrl` dans `lib/services/api_service.dart`.

## Fonctionnalités

- **Authentification** : Inscription et connexion pour acheteurs et vendeurs
- **Calcul de taille de bague** : Mesure et enregistrement des dimensions
- **Catalogue produits** : Navigation et recherche de produits en or
- **Gestion vendeur** : Ajout, modification et suppression de produits
- **Commandes** : Suivi des commandes pour vendeurs et acheteurs

## Build

### Android
```bash
flutter build apk
```

### iOS
```bash
flutter build ios
```

### Web
```bash
flutter build web
```

## Auteur

Développé dans le cadre du projet Ring Sizer.

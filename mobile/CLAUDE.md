# CLAUDE.md — mobile/

Guide pour Claude Code dans l'app mobile **Link & Walk**.

## Vue d'ensemble

Application mobile **React Native (Expo)** de Link & Walk — service d'accompagnement
pour rentrer en sécurité le soir. L'UI est en **français**. L'app reprend la charte de
la landing page web (dossier `../web`) et est conçue d'après la maquette **Figma**.

- Stack : **Expo SDK 54**, **React Native 0.81**, **TypeScript**, template `blank-typescript`.
- Le code natif n'est pas éjecté : on reste en workflow Expo managé.
- SDK 54 (et non le dernier SDK) volontairement, pour rester compatible avec la
  version d'**Expo Go** disponible sur le Play Store / dans BlueStacks.

> ⚠️ Expo évolue vite. Avant d'écrire du code Expo/RN, consulter la doc versionnée :
> https://docs.expo.dev/versions/v54.0.0/

## Lancer l'app

```bash
cd mobile
npm install            # première fois
npx expo start         # démarre le serveur Metro + QR code
```

Puis :
- `npm run android` — lance sur un appareil/émulateur Android.
- `npm run web` — version web (debug rapide).
- App **Expo Go** sur téléphone — scanner le QR code.

### Cible : BlueStacks (émulateur Android)

L'objectif est de faire tourner l'app dans **BlueStacks**. Deux options :

1. **Expo Go dans BlueStacks** : installer Expo Go (APK) dans BlueStacks, puis
   `npx expo start --tunnel` et ouvrir l'URL `exp://…` dans Expo Go. Le `--tunnel`
   évite les soucis réseau entre l'hôte Windows et l'émulateur.
2. **APK de développement** : `npx expo run:android` (nécessite Android SDK) génère
   un APK installable par glisser-déposer dans BlueStacks.

Il n'y a **pas** de build, lint ou test configurés. Vérification de types :

```bash
npx tsc --noEmit
```

## Architecture

```
mobile/
├── App.tsx                  # point d'entrée — SafeAreaProvider + NavigationContainer + ScreenSwitcher
├── navigation/
│   ├── index.tsx            # RootNavigator : Stack (Welcome→Biometric→MainTabs + flux) + Tab Navigator
│   ├── types.ts             # RootStackParamList / MainTabParamList
│   └── helpers.ts           # goToTab() : naviguer vers un onglet depuis un écran de flux
├── screens/
│   ├── BiometricScreen.tsx  # vérification biométrique / empreinte (Figma 23:1146)
│   ├── BookingScreen.tsx    # réserver un trajet : itinéraire + modes (Figma 23:2060) — onglet Trajets
│   ├── DriverScreen.tsx     # chauffeur premium : confirmation de trajet (Figma 23:2360)
│   ├── HistoryScreen.tsx    # historique des trajets, liste scrollable (Figma 23:1304) — onglet Historique
│   ├── HomeScreen.tsx       # accueil SafeWalk : carte, trajet, contacts, SOS (Figma 23:1226) — onglet Accueil
│   ├── MatchingScreen.tsx   # trouver une accompagnatrice : liste à proximité (Figma 23:2122)
│   ├── ProfileScreen.tsx    # profil : avatar, stats, menus, déconnexion (Figma 23:1902) — onglet Profile
│   ├── TrackingScreen.tsx   # suivi de trajet en cours, props pour variante Premium (Figma 23:2512 / 23:2642)
│   └── WelcomeScreen.tsx    # écran de connexion (Figma 3:55)
├── components/
│   ├── AppHeader.tsx        # en-tête commun (logo + réglages) — utilisé par tous les écrans applicatifs
│   ├── BottomNav.tsx        # barre d'onglets commune (Accueil/Historique/Profile/Trajets)
│   ├── Logo.tsx             # logo fleur Link & Walk en SVG (react-native-svg)
│   ├── TripCard.tsx         # carte d'un trajet passé (avatar, badge, prix, timeline)
│   ├── ModeCard.tsx         # carte de choix de mode de trajet (solidaire / premium)
│   ├── CompanionCard.tsx    # carte d'une accompagnatrice (avatar, note, temps/distance, bouton)
│   ├── RouteCard.tsx        # carte itinéraire MA POSITION → DESTINATION (prop compact)
│   ├── MenuRow.tsx          # ligne de menu (icône + titre + sous-titre + chevron) sur carte sombre
│   └── ScreenSwitcher.tsx   # menu de dev (FAB) pour sauter directement à un écran — temporaire
├── assets/
│   ├── map-bg-2.png         # fond carte de l'accueil (extrait de Figma 23:1227)
│   ├── trip-map.png         # carte de suivi du trajet (extrait de Figma 23:2364)
│   └── tracking-map.png     # map plein écran du suivi de trajet (extrait de Figma 23:2513)
└── theme/
    └── colors.ts            # tokens couleurs issus de Figma
```

### Navigation (React Navigation)

- **Pile racine** (`navigation/index.tsx`) : `Welcome → Biometric → MainTabs`, plus les
  écrans de flux poussés par-dessus (`Matching`, `Driver`, `Tracking`, `TrackingPremium`).
- **MainTabs** : Bottom Tab Navigator (Accueil / Historique / Profile / Trajets) dont la
  **`tabBar` est `BottomNav`** (le visuel reste fidèle à la maquette).
- **Écrans-onglets** (Home, History, Profile, Booking) : utilisent `AppHeader` et **ne
  rendent pas** `BottomNav` (fourni par le navigateur).
- **Écrans de flux** (Matching, Driver, Tracking) : rendent eux-mêmes `<BottomNav active="Trajets" .../>`
  et reviennent vers un onglet via `goToTab(navigation, tab)`.
- **Enchaînement câblé** : Welcome `Suivant`→Biometric ; Biometric `Me connecter`→`reset` vers
  MainTabs ; Accueil `Lancer la recherche`→Matching, `Réservez votre chauffeur`→Driver ;
  Booking mode Solidaire→Matching, Premium→Driver ; Matching `Sélectionner`→Tracking ;
  Driver `Confirmer le trajet`→TrackingPremium.
- **Menu de dev** : `ScreenSwitcher` reste monté en overlay (`App.tsx`) et saute directement
  à un écran via un `navigationRef`. Le retirer pour la prod.

### Conventions transverses

- **En-tête / barre de nav** : toujours réutiliser `AppHeader` et `BottomNav`, ne pas
  réinliner ces blocs dans un écran.
- **Tokens design** : toutes les couleurs sont centralisées dans `theme/colors.ts`.
  Ne pas coder de couleur en dur dans les composants — ajouter le token ici.
- **Icônes** : via `@expo/vector-icons` (Feather / Ionicons / …), pas de SVG individuels.
- **Logo** : `components/Logo.tsx` reconstruit la fleur à 6 pétales en `<Svg>` (pas
  d'image bitmap), positions/couleurs extraites du nœud Figma `3:58`. Prop `size`.

## Design — source Figma

La référence visuelle est le fichier Figma **Link & Walk** :

- Fichier : `70VIHWDwqr7yUAhtmLunBf`
- Accueil SafeWalk (écran actuel) : nœud **`23:1226`**
  https://www.figma.com/design/70VIHWDwqr7yUAhtmLunBf/Link---Walk?node-id=23-1226&m=dev
- Suivi de trajet en cours : nœud **`23:2512`** (variante Premium : **`23:2642`**, même
  écran avec d'autres props — voir `TrackingPremiumScreen` dans `App.tsx`)
- Chauffeur premium (confirmation) : nœud **`23:2360`**
- Trouver une accompagnatrice : nœud **`23:2122`**
- Réserver un trajet : nœud **`23:2060`**
- Profil : nœud **`23:1902`**
- Historique des trajets : nœud **`23:1304`** (frame complète : titre, filtres, liste)
- Vérification biométrique : nœud **`23:1146`**
- Écran de connexion : nœud **`3:55`** (= `23:192`, copie identique)
  https://www.figma.com/design/70VIHWDwqr7yUAhtmLunBf/Link---Walk?node-id=3-55&m=dev

Le **serveur MCP Figma** (plugin `figma@claude-plugins-official`) est installé. Pour
implémenter ou mettre à jour un écran depuis Figma, utiliser `get_design_context` sur
le nœud concerné, puis convertir le code React/Tailwind retourné en composants
React Native (StyleSheet), en remplaçant les valeurs en dur par les tokens de
`theme/colors.ts`.

## Conventions

- UI en **français** ; garder le copy en français.
- TypeScript strict ; typer les props des composants.
- Styles via `StyleSheet.create`, pas de style inline répété.
- Couleurs → toujours depuis `theme/colors.ts`.

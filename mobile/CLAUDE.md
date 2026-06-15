# CLAUDE.md — mobile/

Guide pour Claude Code dans l'app mobile **Link & Walk**.

## Vue d'ensemble

Application mobile **React Native (Expo)** de Link & Walk — service d'accompagnement
pour rentrer en sécurité le soir. L'UI est en **français**. Conçue d'après la maquette
**Figma**, branchée sur l'API Express (`../api`) + MySQL (`../database`).

- Stack : **Expo SDK 54**, **React Native 0.81**, **TypeScript**, template `blank-typescript`.
- Workflow Expo managé (pas d'éjection native).
- SDK 54 volontairement (et non le dernier) pour rester compatible avec **Expo Go**.

> ⚠️ Avant d'écrire du code Expo/RN, consulter la doc versionnée :
> https://docs.expo.dev/versions/v54.0.0/

## Trois rôles, deux expériences

L'app sert **3 acteurs** (cf. diagramme de cas d'usage), via le rôle porté par le JWT :

- **PASSENGER** → expérience passagère (réserver, suivre, noter…).
- **GUARDIAN / DRIVER** → expérience **acteur** (voir/accepter des courses, gérer son véhicule).
- **ADMIN** → ne se connecte **pas** dans l'app mobile : il utilise le dashboard web
  servi par l'API (`http://<api>/admin`).

Le **rôle décide de la pile de navigation** au login (voir `navigation/index.tsx`).

## Lancer l'app

```bash
cd mobile
npm install            # première fois
npx expo start         # Metro + QR code  (npx expo start -c pour vider le cache)
npx tsc --noEmit       # vérification de types (pas de lint/test configurés)
```

Cible : **appareil réel via Expo Go** (recommandé) ou BlueStacks. Les fonctions
**natives** (GPS, SMS, batterie, caméra) sont limitées en émulateur — tester sur
téléphone réel.

### Réseau / API — piège récurrent
`API_BASE_URL` (`api/client.ts`) doit être l'**IP LAN du PC** sur le port **3000**
(l'API), **pas** `localhost` (= l'appareil lui-même) et **pas** `:8081` (= Metro).
Si le téléphone ne joint pas l'API alors que le PC oui : **pare-feu Windows**
(autoriser le TCP 3000 entrant) ou téléphone sur un autre Wi-Fi.

## Architecture

```
mobile/
├── App.tsx                  # SafeAreaProvider + AuthProvider + NavigationContainer + ScreenSwitcher
├── auth/
│   └── AuthContext.tsx      # useAuth() : user/loading/login/register/logout/refreshUser ; token via SecureStore
├── navigation/
│   ├── index.tsx            # RootNavigator (gating par auth + rôle) ; MainTabs (passagère) / ActorTabs (acteur)
│   ├── types.ts             # RootStackParamList, MainTabParamList, ActorTabParamList, params de flux
│   └── helpers.ts           # goToTab() : revenir à un onglet depuis un écran de flux
├── screens/
│   │  # — Auth / onboarding —
│   ├── WelcomeScreen.tsx       # connexion (login réel) (Figma 3:55)
│   ├── SignupScreen.tsx        # inscription
│   ├── BiometricScreen.tsx     # écran biométrique maquette (Figma 23:1146)
│   ├── KycScreen.tsx           # tunnel KYC 4 étapes (code, document, selfie) — simulé
│   │  # — Passagère —
│   ├── HomeScreen.tsx          # accueil SafeWalk (Figma 23:1226) — onglet Accueil
│   ├── BookingScreen.tsx       # réserver : GPS réel + destination + modes (Figma 23:2060) — onglet Trajets
│   ├── MatchingScreen.tsx      # accompagnatrices à proximité, notes réelles (Figma 23:2122)
│   ├── DriverScreen.tsx        # chauffeur premium : confirmation (Figma 23:2360)
│   ├── SafeMatchScreen.tsx     # code couleur d'embarquement (validation avant le suivi)
│   ├── TrackingScreen.tsx      # suivi temps réel + SOS + partage + batterie (Figma 23:2512/23:2642)
│   ├── HistoryScreen.tsx       # historique des trajets (Figma 23:1304) — onglet Historique
│   ├── ProfileScreen.tsx       # profil passagère + accès Contacts/KYC (Figma 23:1902) — onglet Profile
│   ├── ContactsScreen.tsx      # contacts d'urgence (CRUD)
│   │  # — Acteur (GUARDIAN / DRIVER) —
│   ├── ActorRequestsScreen.tsx # courses dispo à accepter — onglet Courses
│   ├── ActorRidesScreen.tsx    # mes trajets pris en charge — onglet Mes trajets
│   ├── ActorProfileScreen.tsx  # profil acteur + accès véhicule — onglet Profil
│   └── ActorVehicleScreen.tsx  # gestion du véhicule (chauffeur)
├── api/
│   ├── client.ts            # client HTTP : getJson/postJson/postForm/del/put, token Bearer, ApiError
│   ├── auth.ts              # register/login/me/logout/loadToken (SecureStore)
│   ├── rides.ts             # historique + flux réservation (createRide, fetchMatching, createBooking)
│   ├── safematch.ts         # code SafeMatch (fetch/confirm) + palette couleurs
│   ├── tracking.ts          # points de suivi, incident SOS, complete
│   ├── ratings.ts           # noter un acteur après trajet
│   ├── contacts.ts          # contacts d'urgence + sendEmergencySms() (expo-sms)
│   ├── actor.ts             # côté acteur : requests/accept/rides/vehicle
│   ├── kyc.ts               # tunnel KYC (code, upload document/selfie, status)
│   └── location.ts          # position GPS réelle (expo-location) + reverse-geocoding + Haversine
├── components/
│   ├── AppHeader.tsx        # en-tête commun (logo + réglages)
│   ├── BottomNav.tsx        # barre d'onglets générique (passagère par défaut, ou liste custom acteur)
│   ├── Logo.tsx             # logo fleur en SVG (nœud Figma 3:58), prop size
│   ├── TripCard.tsx         # carte d'un trajet passé
│   ├── ModeCard.tsx         # carte mode (solidaire / premium), prop loading
│   ├── CompanionCard.tsx    # carte accompagnatrice (note, distance, sélection)
│   ├── RouteCard.tsx        # itinéraire MA POSITION → DESTINATION (prop compact)
│   ├── MenuRow.tsx          # ligne de menu (carte sombre), prop onPress
│   ├── ImagePickerField.tsx # champ photo KYC (galerie / caméra)
│   ├── RatingModal.tsx      # modale de notation 5 étoiles post-trajet
│   └── ScreenSwitcher.tsx   # menu de dev (FAB) — temporaire, à retirer en prod
└── theme/
    └── colors.ts            # tokens couleurs issus de Figma
```

### Navigation (React Navigation)

- **Gating par authentification ET rôle** (`navigation/index.tsx`) :
  - session en chargement → `SplashScreen` ;
  - non connecté → `Welcome / Signup / Biometric` ;
  - **passagère** → `MainTabs` (Accueil / Historique / Profile / Trajets) + écrans de
    flux poussés par-dessus : `Kyc`, `Contacts`, `Matching`, `Driver`, `SafeMatch`,
    `Tracking`, `TrackingPremium` ;
  - **acteur** (GUARDIAN/DRIVER) → `ActorTabs` (Courses / Mes trajets / Profil) +
    `ActorVehicle`.
- **Tab bars** : `BottomNav` est rendu en `tabBar` custom. Il est **générique** :
  par défaut les 4 onglets passagère, ou une liste `tabs` custom (acteur).
- **Écrans de flux** (Matching, Driver, Tracking) : rendent eux-mêmes
  `<BottomNav active="Trajets" .../>` et reviennent via `goToTab(navigation, tab)`.
- **Flux passagère câblé** : Booking (crée le trajet) → Matching/Driver (réserve) →
  **SafeMatch** (valide le code) → Tracking → à l'arrivée, `RatingModal`.
- **Menu de dev** : `ScreenSwitcher` (overlay `App.tsx`) ne liste que des écrans
  **sans params** ; Matching/Driver/SafeMatch en sont exclus (params requis).

### Données / API

- L'app **ne parle jamais directement à MySQL** : tout passe par HTTP via `api/`.
- **Auth** : `AuthProvider` (auth/AuthContext) réhydrate la session au boot
  (`loadToken` + `/auth/me`). Le client joint automatiquement `Authorization: Bearer`.
  Erreurs typées via `ApiError` (status + `code` renvoyé par l'API).
- **Repli hors-ligne** : certains écrans retombent sur des données en dur si l'API
  est injoignable (ex. `HistoryScreen`, `MatchingScreen`) pour rester démontrables.
- **GPS / temps réel** : `BookingScreen` récupère la position réelle ; `TrackingScreen`
  envoie la position en polling (~3 s) et fait avancer la progression.
- **Sécurité saisie** : les champs e-mail/mot de passe utilisent
  `autoCapitalize="none"` + `autoCorrect={false}` (le clavier mobile capitalisait le
  mot de passe → 401). L'e-mail est normalisé en minuscules avant envoi.

## Conventions

- UI et copy en **français**.
- TypeScript strict ; typer les props des composants.
- Styles via `StyleSheet.create` ; **couleurs toujours depuis `theme/colors.ts`**
  (ne pas coder de couleur en dur — ajouter le token).
- Icônes via `@expo/vector-icons` (Feather / Ionicons / …), pas de SVG individuels
  (sauf le logo).
- Réutiliser `AppHeader` et `BottomNav`, ne pas réinliner ces blocs.

## Design — source Figma

Fichier : `70VIHWDwqr7yUAhtmLunBf`. Pour (ré)implémenter un écran, utiliser le MCP
Figma (`get_design_context` sur le nœud), puis convertir le React/Tailwind retourné
en composants React Native (StyleSheet) avec les tokens de `theme/colors.ts`.
Nœuds : Accueil `23:1226` · Suivi `23:2512` (premium `23:2642`) · Chauffeur `23:2360`
· Matching `23:2122` · Réserver `23:2060` · Profil `23:1902` · Historique `23:1304`
· Biométrie `23:1146` · Connexion `3:55`. Les écrans hors maquette (KYC, SafeMatch,
Contacts, écrans acteur) suivent la charte existante.

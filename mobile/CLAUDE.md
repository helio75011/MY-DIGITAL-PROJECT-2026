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
├── App.tsx                  # point d'entrée — SafeAreaProvider + écran
├── screens/
│   └── WelcomeScreen.tsx    # écran d'accueil / connexion (Figma 3:55)
├── components/
│   └── Logo.tsx             # logo fleur Link & Walk en SVG (react-native-svg)
└── theme/
    └── colors.ts            # tokens couleurs issus de Figma
```

- **Tokens design** : toutes les couleurs sont centralisées dans `theme/colors.ts`.
  Ne pas coder de couleur en dur dans les composants — ajouter le token ici.
- **Logo** : `components/Logo.tsx` reconstruit la fleur à 6 pétales en `<Svg>` (pas
  d'image bitmap), positions/couleurs extraites du nœud Figma `3:58`. Prop `size`.
- **Écran** : un seul écran pour l'instant (`WelcomeScreen`). Pas encore de
  navigation — quand plusieurs écrans seront ajoutés, installer `expo-router` ou
  `@react-navigation/native`.

## Design — source Figma

La référence visuelle est le fichier Figma **Link & Walk** :

- Fichier : `70VIHWDwqr7yUAhtmLunBf`
- Écran d'accueil/connexion : nœud **`3:55`**
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

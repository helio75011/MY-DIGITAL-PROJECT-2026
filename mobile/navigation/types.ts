import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Écrans de la pile racine (onboarding + flux hors-onglets).
export type RootStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  Biometric: undefined;
  MainTabs: undefined;
  Matching: undefined;
  Driver: undefined;
  Tracking: undefined;
  TrackingPremium: undefined;
};

// Onglets de la barre inférieure.
export type MainTabParamList = {
  Accueil: undefined;
  Historique: undefined;
  Profile: undefined;
  Trajets: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Écrans de la pile racine (onboarding + flux hors-onglets).
export type RootStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  Biometric: undefined;
  MainTabs: undefined;
  Kyc: undefined;
  Matching: RideFlowParams;
  Driver: RideFlowParams;
  SafeMatch: SafeMatchParams;
  Tracking: TrackingParams | undefined;
  TrackingPremium: TrackingParams | undefined;
};

// Params de l'écran SafeMatch (validation à l'embarquement).
export type SafeMatchParams = {
  rideRef: string;
  actorId: number;
  name: string;
  startPoint: string;
  endPoint: string;
  /** Variante du suivi à ouvrir après confirmation. */
  premium?: boolean;
  /** Code déjà connu (renvoyé par /bookings) pour éviter un GET. */
  color?: string;
  digits?: string;
};

// Params du suivi : référence du trajet à suivre (absente = mode démo).
export type TrackingParams = {
  rideRef?: string;
  /** Identifiant de l'acteur (pour la notation post-trajet). */
  actorId?: number;
  name?: string;
  startPoint?: string;
  endPoint?: string;
};

// Paramètres transmis aux écrans du flux de réservation (depuis Booking).
export type RideFlowParams = {
  rideRef: string;
  mode: 'solidaire' | 'premium';
  startPoint: string;
  endPoint: string;
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

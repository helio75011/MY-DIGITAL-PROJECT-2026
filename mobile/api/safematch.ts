import { api } from './client';

export type SafeMatchCode = {
  color: string;
  digits: string;
  confirmed?: boolean;
};

/** Récupère le code SafeMatch d'embarquement d'un trajet. */
export async function fetchSafeMatch(rideRef: string): Promise<SafeMatchCode> {
  return api.getJson(`/rides/${rideRef}/safematch`);
}

/** La passagère confirme que le code annoncé correspond (embarquement validé). */
export async function confirmSafeMatch(rideRef: string): Promise<{ confirmed: boolean }> {
  return api.postJson(`/rides/${rideRef}/safematch/confirm`, {});
}

// Couleurs SafeMatch -> couleur d'affichage (hex). Doit rester cohérent avec
// la palette côté API (api/src/safematch/store.js).
export const SAFEMATCH_COLORS: Record<string, string> = {
  VIOLET: '#6d4ea2',
  ROSE: '#d9436a',
  BLEU: '#2f6fd9',
  VERT: '#07521d',
  ORANGE: '#e07a1f',
  TURQUOISE: '#1aa7a0',
};

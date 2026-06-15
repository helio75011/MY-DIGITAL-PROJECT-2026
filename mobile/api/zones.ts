import { api } from './client';

export type SafeZone = {
  id: number;
  name: string;
  city: string | null;
  level: number; // 1..3 (3 = très sûre/éclairée)
  latitude: number;
  longitude: number;
};

/** Référentiel des zones sûres / bien éclairées. */
export async function fetchSafeZones(): Promise<SafeZone[]> {
  return api.getJson('/safe-zones');
}

// Couleur d'affichage selon le niveau (vert = sûr, orange = correct, rouge = vigilance).
export function zoneColor(level: number): string {
  if (level >= 3) return '#07521d';
  if (level === 2) return '#e07a1f';
  return '#ba1a1a';
}

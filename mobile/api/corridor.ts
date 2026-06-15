import { api } from './client';

export type CorridorAssessment = {
  score: number; // 0..100
  level: 'safe' | 'moderate' | 'caution';
  label: string;
  distanceKm: number;
  safeZonesOnPath: { id: number; name: string; level: number }[];
};

/** "IA Corridor" : évalue la sûreté d'un itinéraire (départ → arrivée). */
export async function assessCorridor(input: {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}): Promise<CorridorAssessment> {
  return api.postJson('/corridor/assess', input);
}

export function corridorColor(level: CorridorAssessment['level']): string {
  if (level === 'safe') return '#07521d';
  if (level === 'moderate') return '#e07a1f';
  return '#ba1a1a';
}

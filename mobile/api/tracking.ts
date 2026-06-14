import { api } from './client';

export type TrackType = 'DEPARTURE' | 'POSITION' | 'ARRIVAL' | 'ALERT';

export type TrackPoint = {
  type: TrackType;
  at: string;
  latitude: string;
  longitude: string;
};

/** Envoie un point de suivi GPS pour un trajet (polling temps réel). */
export async function sendTrackPoint(
  rideRef: string,
  latitude: number,
  longitude: number,
  type: TrackType = 'POSITION'
): Promise<void> {
  await api.postJson(`/rides/${rideRef}/track`, { latitude, longitude, type });
}

/** Récupère tous les points de suivi d'un trajet. */
export async function fetchTrack(
  rideRef: string
): Promise<{ rideRef: string; status: string; points: TrackPoint[] }> {
  return api.getJson(`/rides/${rideRef}/track`);
}

/** Déclenche une alerte SOS (incident + point ALERT si position fournie). */
export async function reportIncident(input: {
  rideRef?: string;
  type?: 'SOS' | 'DELAY' | 'MALAISE' | 'OTHER';
  description?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ incidentRef: string; type: string }> {
  return api.postJson('/incidents', input);
}

/** Marque le trajet comme terminé. */
export async function completeRide(
  rideRef: string,
  position?: { latitude: number; longitude: number }
): Promise<{ rideRef: string; status: string }> {
  return api.postJson(`/rides/${rideRef}/complete`, position ?? {});
}

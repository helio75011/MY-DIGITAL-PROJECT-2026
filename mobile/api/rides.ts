import type { Trip } from '../components/TripCard';
import { api } from './client';

// L'API renvoie `price: null` pour un accompagnement gratuit ; le composant
// TripCard attend `price?: string` (absent). On normalise ici.
type ApiTrip = Omit<Trip, 'price'> & { price: string | null };

/** Récupère l'historique des trajets terminés de la passagère connectée. */
export async function fetchRideHistory(): Promise<Trip[]> {
  const rows = await api.getJson<ApiTrip[]>('/rides/history');
  return rows.map(({ price, ...rest }) => ({
    ...rest,
    ...(price ? { price } : {}),
  }));
}

// --- Flux de réservation -----------------------------------------------------

export type RideMode = 'solidaire' | 'premium';

export type MatchActor = {
  userId: number;
  name: string;
  rating: string; // note moyenne réelle, ou '—'
  ratingCount: number;
  time: string;
  distance: string;
  vehicle: { brand: string; model: string; color: string; plate: string } | null;
};

/** Crée un trajet. Si `scheduledAt` est fourni, le trajet est planifié. */
export async function createRide(input: {
  startPoint: string;
  endPoint: string;
  distanceKm?: number;
  estimatedTime?: number;
  /** ISO string (ex. new Date(...).toISOString()) pour un trajet planifié. */
  scheduledAt?: string;
}): Promise<{ rideRef: string; status: string; scheduledAt: string | null }> {
  return api.postJson('/rides', input);
}

export type UpcomingRide = {
  id: string;
  departurePlace: string;
  arrivalPlace: string;
  date: string;
  time: string;
};

/** Trajets planifiés à venir de la passagère connectée. */
export async function fetchUpcoming(): Promise<UpcomingRide[]> {
  return api.getJson('/rides/upcoming');
}

/** Liste les acteurs disponibles pour un mode, avec note moyenne réelle. */
export async function fetchMatching(mode: RideMode): Promise<MatchActor[]> {
  return api.getJson<MatchActor[]>(`/matching?mode=${mode}`);
}

/** Réserve un acteur pour un trajet ; passe le trajet en 'ongoing'. */
export async function createBooking(input: {
  rideRef: string;
  actorId: number;
  mode: RideMode;
  price?: number;
  isSponsored?: boolean;
}): Promise<{
  rideRef: string;
  status: string;
  safematch?: { color: string; digits: string };
}> {
  return api.postJson('/bookings', input);
}

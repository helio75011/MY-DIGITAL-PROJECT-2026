import type { Trip } from '../components/TripCard';
import { api } from './client';

// L'API renvoie `price: null` pour un accompagnement gratuit ; le composant
// TripCard attend `price?: string` (absent). On normalise ici.
type ApiTrip = Omit<Trip, 'price'> & { price: string | null };

/** Récupère l'historique des trajets terminés d'une passagère. */
export async function fetchRideHistory(passengerId = 1): Promise<Trip[]> {
  const rows = await api.getJson<ApiTrip[]>(`/rides/history?passengerId=${passengerId}`);
  return rows.map(({ price, ...rest }) => ({
    ...rest,
    ...(price ? { price } : {}),
  }));
}

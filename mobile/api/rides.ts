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

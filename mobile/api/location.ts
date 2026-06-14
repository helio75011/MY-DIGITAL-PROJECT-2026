import * as Location from 'expo-location';

export type GeoPoint = {
  label: string; // adresse lisible (reverse-geocoding) ou coordonnées
  latitude: number;
  longitude: number;
};

/**
 * Récupère la position GPS actuelle et tente de la convertir en adresse lisible.
 * Lève 'permission_denied' si l'utilisatrice refuse la localisation.
 */
export async function getCurrentPosition(): Promise<GeoPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('permission_denied');
  }

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = pos.coords;

  let label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  try {
    const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (addr) {
      // Compose une adresse courte « 12 Rue de la Paix, Paris ».
      const street = [addr.streetNumber, addr.street].filter(Boolean).join(' ');
      label = [street, addr.city].filter(Boolean).join(', ') || label;
    }
  } catch {
    // reverse-geocoding indisponible : on garde les coordonnées.
  }

  return { label, latitude, longitude };
}

/** Estime une distance à vol d'oiseau (km) entre deux points (formule de Haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 100) / 100;
}

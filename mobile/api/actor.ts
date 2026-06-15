import { api } from './client';

export type RideRequest = {
  rideRef: string;
  startPoint: string;
  endPoint: string;
  distance: number | null;
  estimatedTime: number | null;
  createdAt: string;
  passenger: string;
};

export type ActorRide = {
  rideRef: string;
  startPoint: string;
  endPoint: string;
  status: string;
  createdAt: string;
  passenger: string;
};

export type Vehicle = {
  id: number;
  plate: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  type: string;
};

/** Courses en recherche, disponibles à l'acceptation. */
export async function fetchRequests(): Promise<RideRequest[]> {
  return api.getJson('/actor/requests');
}

/** Accepter une course (devient l'acteur du trajet, passe en ongoing). */
export async function acceptRequest(rideRef: string): Promise<{ rideRef: string; status: string }> {
  return api.postJson(`/actor/requests/${rideRef}/accept`, {});
}

/** Trajets pris en charge par l'acteur. */
export async function fetchActorRides(): Promise<ActorRide[]> {
  return api.getJson('/actor/rides');
}

/** Véhicule de l'acteur (null si aucun). */
export async function fetchVehicle(): Promise<Vehicle | null> {
  return api.getJson('/actor/vehicle');
}

/** Crée/met à jour le véhicule de l'acteur. */
export async function saveVehicle(input: {
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  type?: string;
}): Promise<{ saved: boolean }> {
  // PUT via le client : on ajoute une méthode dédiée si besoin ; ici on passe par fetch.
  return api.put('/actor/vehicle', input);
}

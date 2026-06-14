import { api } from './client';

/** Note un acteur (accompagnatrice/chauffeur) de 1 à 5, commentaire optionnel. */
export async function rateActor(input: {
  ratedId: number;
  rating: number;
  comment?: string;
}): Promise<{ rated: boolean; average: string; count: number }> {
  return api.postJson('/ratings', input);
}

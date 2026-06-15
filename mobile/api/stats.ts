import { api } from './client';

export type Badge = {
  code: string;
  label: string;
  icon: string;
  unlocked: boolean;
};

export type UserStats = {
  completedTrips: number;
  trustScore: number;
  ratingCount: number;
  memberDays: number;
  badges: Badge[];
};

/** Statistiques de gamification de l'utilisateur connecté. */
export async function fetchStats(): Promise<UserStats> {
  return api.getJson('/users/me/stats');
}

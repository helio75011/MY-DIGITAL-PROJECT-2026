import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from './client';

// Utilisateur tel que renvoyé par l'API (toPublicUser côté back-end).
export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isVerified: boolean;
  role: string;
};

type AuthResponse = { token: string; user: AuthUser };

const TOKEN_KEY = 'lw_auth_token';

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

/** Inscription : crée le compte, stocke le token et le rend actif. */
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { token, user } = await api.postJson<AuthResponse>('/auth/register', payload);
  await persistToken(token);
  return user;
}

/** Connexion : vérifie les identifiants, stocke le token et le rend actif. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const { token, user } = await api.postJson<AuthResponse>('/auth/login', { email, password });
  await persistToken(token);
  return user;
}

/** Récupère l'utilisateur courant à partir du token actif (réhydratation). */
export async function me(): Promise<AuthUser> {
  const { user } = await api.getJson<{ user: AuthUser }>('/auth/me');
  return user;
}

/** Déconnexion : efface le token du stockage et de la mémoire. */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  setAuthToken(null);
}

/**
 * Au démarrage de l'app : recharge le token persistant et le rend actif.
 * Renvoie true si un token était présent.
 */
export async function loadToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  setAuthToken(token);
  return !!token;
}

async function persistToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  setAuthToken(token);
}

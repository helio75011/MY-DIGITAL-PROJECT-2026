/**
 * Client HTTP minimal vers l'API Link & Walk (../../api).
 *
 * IMPORTANT — URL de base : depuis un émulateur (BlueStacks) ou un appareil,
 * `localhost` désigne l'appareil lui-même, pas le PC qui héberge l'API. Il faut
 * l'IP du PC sur le réseau local (la même que celle affichée par `expo start`,
 * ex. exp://192.168.1.58:8081). Adapter API_BASE_URL si l'IP change.
 */
export const API_BASE_URL = 'http://192.168.1.58:3000';

// Token JWT courant, gardé en mémoire pour être joint à chaque requête.
// Il est (re)posé depuis expo-secure-store par la couche api/auth.ts.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// En-têtes communs : JSON + Authorization si un token est présent.
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

// Erreur HTTP enrichie : on remonte le code et le champ `error` renvoyé par l'API
// (ex. 'invalid_credentials', 'email_taken') pour afficher un message adapté.
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code?: string) {
    super(code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseError(res: Response): Promise<never> {
  let code: string | undefined;
  try {
    const body = await res.json();
    code = body?.error;
  } catch {
    // corps non-JSON : on garde juste le status
  }
  throw new ApiError(res.status, code);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: buildHeaders() });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<T>;
}

/**
 * POST multipart/form-data (upload de fichiers KYC).
 * On NE fixe PAS le Content-Type : fetch ajoute le boundary lui-même.
 * On joint quand même le token d'authentification.
 */
async function postForm<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = authToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<T>;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<T>;
}

export const api = { getJson, postJson, postForm, del };

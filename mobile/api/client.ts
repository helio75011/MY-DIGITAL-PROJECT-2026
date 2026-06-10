/**
 * Client HTTP minimal vers l'API Link & Walk (../../api).
 *
 * IMPORTANT — URL de base : depuis un émulateur (BlueStacks) ou un appareil,
 * `localhost` désigne l'appareil lui-même, pas le PC qui héberge l'API. Il faut
 * l'IP du PC sur le réseau local (la même que celle affichée par `expo start`,
 * ex. exp://192.168.1.58:8081). Adapter API_BASE_URL si l'IP change.
 */
export const API_BASE_URL = 'http://192.168.1.58:3000';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} → HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = { getJson };

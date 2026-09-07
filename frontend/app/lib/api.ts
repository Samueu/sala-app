import { API_BASE_URL } from './config';
import { getAccessToken } from './auth';

/**
 * GET autenticado no backend (Authorization: Bearer <access token>). `path` é
 * relativo, ex.: "/api/servers". Lança se a resposta não for 2xx.
 */
export async function fetchJson<T>(path: string): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Falha ao chamar ${path} (HTTP ${response.status})`);
  }

  return response.json();
}

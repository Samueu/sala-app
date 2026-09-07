import { API_BASE_URL } from './config';
import { getAccessToken } from './auth';

/**
 * Lê o corpo de uma resposta de erro pra usar como mensagem. O backend devolve erros
 * de negócio como uma string JSON simples (ex.: "Usuário não encontrado."), mas em
 * erros não tratados pode vir HTML/vazio — cai pro status HTTP nesses casos. Lê o
 * corpo uma única vez (Response só permite isso uma vez).
 */
async function errorMessage(response: Response, path: string): Promise<string> {
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string' && parsed.trim()) return parsed;
    } catch {
      // corpo não é JSON — ignora e cai no fallback abaixo.
    }
  } catch {
    // corpo ilegível — ignora e cai no fallback abaixo.
  }
  return `Falha ao chamar ${path} (HTTP ${response.status})`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/**
 * GET autenticado no backend (Authorization: Bearer <access token>). `path` é
 * relativo, ex.: "/api/servers". Lança se a resposta não for 2xx.
 */
export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: await authHeaders() });

  if (!response.ok) {
    throw new Error(await errorMessage(response, path));
  }

  return response.json();
}

/**
 * POST autenticado com corpo JSON opcional. `path` é relativo. 204 (No Content)
 * devolve undefined em vez de tentar parsear um corpo vazio.
 */
export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(await authHeaders()),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, path));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** DELETE autenticado. `path` é relativo. Lança se a resposta não for 2xx. */
export async function deleteRequest(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, path));
  }
}

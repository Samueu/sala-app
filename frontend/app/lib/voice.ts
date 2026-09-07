import { API_BASE_URL } from './config';
import { getAccessToken } from './auth';

/** Espelha o VoiceTokenResponse do backend (Dtos/VoiceTokenResponse.cs), camelCase. */
export interface VoiceToken {
  token: string;
  url: string;
  roomName: string;
}

export async function fetchVoiceToken(channelId: string): Promise<VoiceToken> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/voice/token?channelId=${encodeURIComponent(channelId)}`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(`Não foi possível obter o token de voz (HTTP ${response.status})`);
  }

  return response.json();
}

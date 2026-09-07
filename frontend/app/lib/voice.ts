import { fetchJson } from './api';

/** Espelha o VoiceTokenResponse do backend (Dtos/VoiceTokenResponse.cs), camelCase. */
export interface VoiceToken {
  token: string;
  url: string;
  roomName: string;
}

export function fetchVoiceToken(channelId: string): Promise<VoiceToken> {
  return fetchJson<VoiceToken>(`/api/voice/token?channelId=${encodeURIComponent(channelId)}`);
}

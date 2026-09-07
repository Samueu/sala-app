import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './config';
import { getAccessToken, setAccessTokenProvider } from './auth';

export { setAccessTokenProvider };

const HUB_URL = `${API_BASE_URL}/hubs/chat`;

/**
 * Espelha o MessageDto do backend (Dtos/MessageDto.cs). O SignalR usa
 * System.Text.Json por padrão, que serializa em camelCase.
 */
export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  channelId: string;
  authorId: string;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  parentMessageId: string | null;
}

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

// Canais que o hook já pediu pra entrar. Reentra neles automaticamente depois de
// um reconnect automático, porque o SignalR troca o ConnectionId nesse caso e o
// usuário perde todos os grupos silenciosamente sem isso.
const activeChannels = new Set<string>();

function getChatConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: async () => (await getAccessToken()) ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.onreconnected(async () => {
      for (const channelId of activeChannels) {
        try {
          await connection!.invoke('JoinChannel', channelId);
        } catch (err) {
          console.error(`Falha ao reentrar no canal ${channelId} após reconectar`, err);
        }
      }
    });
  }

  return connection;
}

export async function ensureConnected(): Promise<signalR.HubConnection> {
  const conn = getChatConnection();

  if (conn.state === signalR.HubConnectionState.Connected) {
    return conn;
  }

  if (!startPromise) {
    startPromise = conn.start().catch((err) => {
      startPromise = null;
      throw err;
    });
  }

  await startPromise;
  return conn;
}

export async function joinChannel(channelId: string): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke('JoinChannel', channelId);
  activeChannels.add(channelId);
}

export async function leaveChannel(channelId: string): Promise<void> {
  activeChannels.delete(channelId);
  const conn = getChatConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke('LeaveChannel', channelId);
  }
}

export async function sendMessage(
  channelId: string,
  content: string,
  parentMessageId?: string | null
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke('SendMessage', channelId, content, parentMessageId ?? null);
}

export function onReceiveMessage(handler: (message: ChatMessage) => void): () => void {
  const conn = getChatConnection();
  conn.on('ReceiveMessage', handler);
  return () => conn.off('ReceiveMessage', handler);
}

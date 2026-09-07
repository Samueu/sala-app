import { Server, Channel, Message } from '@/app/types';
import { fetchJson } from './api';
import { ChatMessage } from './signalr';
import { initials, formatTime } from './data';

// Formato exato de Server/Channel devolvido pelo backend (Models/Server.cs,
// Models/Channel.cs, camelCase). Só os campos que a gente de fato usa.
interface ServerApiModel {
  id: string;
  name: string;
}

interface ChannelApiModel {
  id: string;
  name: string;
  topic: string | null;
}

function toServer(api: ServerApiModel): Server {
  // mark/badge/rooms não têm equivalente no backend hoje — mark é derivado do
  // nome (mesmo helper usado pra iniciais de usuário), badge/rooms ficam
  // vazios/zerados (sem rastreio de leitura nem presença de voz ainda).
  return { id: api.id, name: api.name, mark: initials(api.name), badge: 0, channels: [], rooms: [] };
}

function toChannel(api: ChannelApiModel): Channel {
  // intro não existe no backend — gera um texto genérico de abertura de canal.
  return { id: api.id, name: api.name, topic: api.topic ?? '', intro: `Início de #${api.name}.` };
}

/** Exportado pra context.tsx reaproveitar ao mapear mensagens ao vivo do useChat. */
export function toMessage(api: ChatMessage): Message {
  return {
    id: api.id,
    name: api.authorUsername ?? 'Usuário',
    time: formatTime(new Date(api.createdAt)),
    text: api.content,
  };
}

export async function fetchServers(): Promise<Server[]> {
  const raw = await fetchJson<ServerApiModel[]>('/api/servers');
  return raw.map(toServer);
}

export async function fetchChannels(serverId: string): Promise<Channel[]> {
  const raw = await fetchJson<ChannelApiModel[]>(`/api/servers/${encodeURIComponent(serverId)}/channels`);
  return raw.map(toChannel);
}

/**
 * Histórico do canal, já reconstruído em árvore (mensagens-raiz com `replies`
 * aninhado um nível — mesmo formato que ThreadPanel.tsx espera).
 */
export async function fetchMessages(channelId: string): Promise<Message[]> {
  const raw = await fetchJson<ChatMessage[]>(`/api/channels/${encodeURIComponent(channelId)}/messages`);

  const byId = new Map<string, Message>();
  for (const m of raw) {
    byId.set(m.id, toMessage(m));
  }

  const roots: Message[] = [];
  for (const m of raw) {
    const mapped = byId.get(m.id)!;
    if (m.parentMessageId) {
      const parent = byId.get(m.parentMessageId);
      if (parent) {
        parent.replies = [...(parent.replies ?? []), mapped];
      }
    } else {
      roots.push(mapped);
    }
  }

  return roots;
}

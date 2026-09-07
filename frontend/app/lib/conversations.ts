import { DirectMessage, Message } from '@/app/types';
import { fetchJson, postJson } from './api';
import { formatTime } from './data';
import { DirectChatMessage } from './signalr';

// Formato exato devolvido pelo backend (Dtos/ConversationSummaryDto.cs), camelCase.
interface ConversationSummaryApiModel {
  id: string;
  friendId: string;
  friendUsername: string;
  friendAvatarUrl: string | null;
  lastMessageContent: string | null;
  lastMessageAt: string;
}

// Formato exato devolvido pelo backend (Dtos/ConversationDetailDto.cs), camelCase.
interface ConversationDetailApiModel {
  id: string;
  friendId: string;
  friendUsername: string;
  friendAvatarUrl: string | null;
  messages: DirectChatMessage[];
}

export interface ConversationDetail {
  conversationId: string;
  friendId: string;
  friendUsername: string;
  messages: Message[];
}

/** Espelha toMessage de servers.ts, mas pra DirectMessage (sem replies/threads). */
export function toDirectMessage(api: DirectChatMessage): Message {
  return {
    id: api.id,
    name: api.senderUsername ?? 'Usuário',
    time: formatTime(new Date(api.createdAt)),
    text: api.content,
  };
}

/** Conversas reais do usuário autenticado, pra popular a sidebar de DMs ao montar o app. */
export async function fetchConversations(): Promise<DirectMessage[]> {
  const raw = await fetchJson<ConversationSummaryApiModel[]>('/api/conversations');
  return raw.map((c) => ({ id: c.friendId, name: c.friendUsername, unread: 0 }));
}

/** Busca (ou cria) a conversa com esse amigo e devolve o histórico já convertido. */
export async function fetchConversation(friendId: string): Promise<ConversationDetail> {
  const raw = await fetchJson<ConversationDetailApiModel>(`/api/conversations/${encodeURIComponent(friendId)}`);
  return {
    conversationId: raw.id,
    friendId: raw.friendId,
    friendUsername: raw.friendUsername,
    messages: raw.messages.map(toDirectMessage),
  };
}

export async function sendDirectMessage(conversationId: string, content: string): Promise<Message> {
  const raw = await postJson<DirectChatMessage>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content }
  );
  return toDirectMessage(raw);
}

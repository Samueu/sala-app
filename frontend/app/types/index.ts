export interface Message {
  id: string;
  name: string;
  time: string;
  text: string;
  replies?: Message[];
}

export interface Channel {
  id: string;
  name: string;
  topic: string;
  intro: string;
  unread?: number;
}

export interface Server {
  id: string;
  name: string;
  mark: string;
  badge: number;
  channels: Channel[];
  rooms: VoiceRoom[];
}

export interface VoiceRoom {
  id: string;
  name: string;
  people: string[];
}

export interface DirectMessage {
  id: string;
  name: string;
  unread: number;
}

export type FriendRequestStatus = 'Pending' | 'Accepted' | 'Rejected';

/** Espelha FriendRequestDto do backend (Dtos/FriendRequestDto.cs). */
export interface FriendRequestItem {
  id: string;
  senderId: string;
  senderUsername: string | null;
  senderAvatarUrl: string | null;
  receiverId: string;
  receiverUsername: string | null;
  receiverAvatarUrl: string | null;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

/** Espelha FriendDto do backend (Dtos/FriendDto.cs) — um item de GET /api/friends. */
export interface Friend {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  friendsSince: string;
}

export interface AppState {
  /** Servidores reais do usuário autenticado (GET /api/servers), buscados via app/lib/servers.ts. */
  servers: Record<string, Server>;
  serverId: string;
  scopeKind: 'server' | 'dm' | 'friends';
  activeId: string;
  draft: string;
  threadKey: { key: string; idx: number } | null;
  threadDraft: string;
  voiceRoom: string | null;
  muted: boolean;
  deafened: boolean;
  speaking: string;
  mobTab: 'conversas' | 'voz' | 'perfil';
  mobScreen: 'list' | 'chat' | 'thread' | 'voice' | 'profile';
  convos: Record<string, Message[]>;
  /**
   * Contatos de DM (mock, sem backend real). Começa com os 3 mocks de app/lib/data.ts
   * e ganha entradas quando o usuário clica "Mensagem" num amigo real (ver
   * startDirectMessage em app/lib/context.tsx).
   */
  dmContacts: DirectMessage[];
}

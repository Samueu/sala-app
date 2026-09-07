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

export interface AppState {
  serverId: string;
  scopeKind: 'server' | 'dm';
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
}

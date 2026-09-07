'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppState, Message } from '@/app/types';
import { INITIAL_CONVOS } from './data';

interface AppContextType extends AppState {
  setActiveId: (id: string) => void;
  setScopekind: (kind: 'server' | 'dm') => void;
  setDraft: (draft: string) => void;
  setThreadKey: (key: { key: string; idx: number } | null) => void;
  setThreadDraft: (draft: string) => void;
  setVoiceRoom: (room: string | null) => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
  setMobTab: (tab: 'conversas' | 'voz' | 'perfil') => void;
  setMobScreen: (screen: 'list' | 'chat' | 'thread' | 'voice' | 'profile') => void;
  sendMessage: (text: string) => void;
  sendReply: (text: string) => void;
  setConvos: (convos: Record<string, Message[]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    serverId: 'jogatina',
    scopeKind: 'server',
    activeId: 'jogatina/geral',
    draft: '',
    threadKey: null,
    threadDraft: '',
    voiceRoom: null,
    muted: false,
    deafened: false,
    speaking: 'Bruno',
    mobTab: 'conversas',
    mobScreen: 'list',
    convos: INITIAL_CONVOS,
  });

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setState((prev) => {
        const convos = { ...prev.convos };
        const messages = convos[prev.activeId] || [];
        convos[prev.activeId] = [
          ...messages,
          { id: Date.now().toString(), name: 'Você', time, text: trimmed },
        ];
        return { ...prev, convos, draft: '' };
      });
    },
    []
  );

  const sendReply = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState((prev) => {
      if (!prev.threadKey) return prev;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const convos = { ...prev.convos };
      const messages = convos[prev.threadKey.key] || [];
      const parent = { ...messages[prev.threadKey.idx] };
      parent.replies = [
        ...(parent.replies || []),
        { id: Date.now().toString(), name: 'Você', time, text: trimmed },
      ];
      messages[prev.threadKey.idx] = parent;
      convos[prev.threadKey.key] = messages;

      return { ...prev, convos, threadDraft: '' };
    });
  }, []);

  const value: AppContextType = {
    ...state,
    setActiveId: (id) => setState((prev) => ({ ...prev, activeId: id, threadKey: null })),
    setScopekind: (kind) => setState((prev) => ({ ...prev, scopeKind: kind })),
    setDraft: (draft) => setState((prev) => ({ ...prev, draft })),
    setThreadKey: (key) => setState((prev) => ({ ...prev, threadKey: key })),
    setThreadDraft: (draft) => setState((prev) => ({ ...prev, threadDraft: draft })),
    setVoiceRoom: (room) => setState((prev) => ({ ...prev, voiceRoom: room, deafened: false })),
    setMuted: (muted) => setState((prev) => ({ ...prev, muted })),
    setDeafened: (deafened) =>
      setState((prev) => ({
        ...prev,
        deafened,
        muted: deafened ? true : prev.muted,
      })),
    setMobTab: (tab) => setState((prev) => ({ ...prev, mobTab: tab })),
    setMobScreen: (screen) => setState((prev) => ({ ...prev, mobScreen: screen })),
    sendMessage,
    sendReply,
    setConvos: (convos) => setState((prev) => ({ ...prev, convos })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

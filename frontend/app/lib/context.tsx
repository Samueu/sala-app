'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, DirectMessage, Message, Server } from '@/app/types';
import { DMS, INITIAL_CONVOS, formatTime } from './data';
import { fetchServers, fetchChannels, fetchMessages, toMessage } from './servers';
import { useChat } from './useChat';
import { ensureConnected } from './signalr';

interface AppContextType extends AppState {
  setActiveId: (id: string) => void;
  setScopekind: (kind: 'server' | 'dm' | 'friends') => void;
  setServerId: (id: string) => void;
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
  /**
   * Adiciona (se ainda não existir, sem duplicar) um amigo real aos contatos de DM
   * mock e navega pra conversa com ele — usado pelo botão "Mensagem" do FriendsPanel.
   */
  startDirectMessage: (friend: { id: string; username: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * activeId de canal real é "{serverId}/{channelId}" (Guids reais); DM é
 * "dm/{dmId}" (mock). Devolve o channelId real, ou null se for DM.
 */
function getRealChannelId(activeId: string): string | null {
  if (activeId.startsWith('dm/')) return null;
  const [, channelId] = activeId.split('/');
  return channelId ?? null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    servers: {},
    serverId: '',
    // Começa em "Diretas" (mock, sempre disponível na hora) porque servers/channels
    // chegam de forma assíncrona da API — evita a janela de carregamento em que
    // Sidebar/ChatArea tentariam ler um servidor que ainda não foi buscado.
    scopeKind: 'dm',
    activeId: `dm/${DMS[0].id}`,
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
    dmContacts: DMS,
  });

  const realChannelId = getRealChannelId(state.activeId);
  const chat = useChat(realChannelId ?? '');

  // Estabelece a conexão SignalR assim que o app carrega (usuário já autenticado —
  // AppProvider só monta depois do AuthGate), independente de qual scope o usuário
  // está navegando. Sem isso, a conexão só abriria via useChat/joinChannel quando um
  // canal real fosse aberto — e como o app começa em modo DM (mock), presença e
  // eventos de amigos poderiam nunca funcionar. ensureConnected() é idempotente
  // (reusa a conexão/promise em andamento), então chamar de novo depois via
  // joinChannel é seguro.
  useEffect(() => {
    ensureConnected().catch((err) => console.error('Falha ao conectar ao SignalR', err));
  }, []);

  // Busca os servidores do usuário ao montar, depois os canais de cada um (N+1,
  // aceitável no volume esperado). rooms fica sempre [] — sem presença de voz via
  // REST ainda (fora de escopo).
  useEffect(() => {
    let cancelled = false;

    fetchServers()
      .then(async (servers) => {
        if (cancelled) return;
        const withChannels = await Promise.all(
          servers.map(async (server) => {
            try {
              const channels = await fetchChannels(server.id);
              return { ...server, channels };
            } catch (err) {
              console.error(`Falha ao buscar canais do servidor ${server.id}`, err);
              return server;
            }
          })
        );
        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          servers: Object.fromEntries(withChannels.map((s) => [s.id, s] as [string, Server])),
        }));
      })
      .catch((err) => console.error('Falha ao buscar servidores', err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Histórico de mensagens do canal real ativo (REST) — DMs continuam vindo só de
  // INITIAL_CONVOS/sendMessage local, não passam por aqui.
  const [channelHistory, setChannelHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (!realChannelId) {
      setChannelHistory([]);
      return;
    }

    let cancelled = false;
    fetchMessages(realChannelId)
      .then((messages) => {
        if (!cancelled) setChannelHistory(messages);
      })
      .catch((err) => {
        console.error(`Falha ao buscar histórico do canal ${realChannelId}`, err);
        if (!cancelled) setChannelHistory([]);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realChannelId]);

  // Funde histórico (REST) + mensagens ao vivo (SignalR, via useChat) em
  // convos[activeId] — recalculado por inteiro a cada mudança, não é um append
  // incremental, então nunca duplica.
  useEffect(() => {
    if (!realChannelId) return;

    const live = chat.messages.map(toMessage);
    setState((prev) => ({
      ...prev,
      convos: { ...prev.convos, [prev.activeId]: [...channelHistory, ...live] },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelHistory, chat.messages, realChannelId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (realChannelId) {
        setState((prev) => ({ ...prev, draft: '' }));
        chat.sendMessage(trimmed).catch((err) => console.error('Falha ao enviar mensagem', err));
        return;
      }

      // DM: continua 100% mock, sem backend.
      const time = formatTime(new Date());
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
    [realChannelId, chat]
  );

  const sendReply = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState((prev) => {
      if (!prev.threadKey) return prev;

      const time = formatTime(new Date());
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
    setServerId: (id) => setState((prev) => ({ ...prev, serverId: id })),
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
    startDirectMessage: (friend) =>
      setState((prev) => {
        const exists = prev.dmContacts.some((d) => d.id === friend.id);
        const dmContacts: DirectMessage[] = exists
          ? prev.dmContacts
          : [{ id: friend.id, name: friend.username, unread: 0 }, ...prev.dmContacts];

        return {
          ...prev,
          dmContacts,
          scopeKind: 'dm',
          activeId: `dm/${friend.id}`,
          threadKey: null,
        };
      }),
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

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, DirectMessage, Message, Server } from '@/app/types';
import { formatTime } from './data';
import { fetchServers, fetchChannels, fetchMessages, toMessage } from './servers';
import { fetchConversations } from './conversations';
import { useChat } from './useChat';
import { useDirectMessages } from './useDirectMessages';
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
   * Adiciona (se ainda não existir, sem duplicar) um amigo real aos contatos de DM e
   * navega pra conversa com ele — usado pelo botão "Mensagem" do FriendsPanel. Quem
   * busca/cria a Conversation de verdade é useDirectMessages, reagindo à mudança de
   * activeId/friendId.
   */
  startDirectMessage: (friend: { id: string; username: string }) => void;
  /**
   * True enquanto a Conversation da DM ativa ainda está sendo buscada/criada
   * (GET /api/conversations/{friendId}) — usado por ChatArea pra desabilitar o envio
   * até a conversa estar pronta, em vez de aceitar o clique e descartar a mensagem.
   */
  activeDmLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * activeId de canal real é "{serverId}/{channelId}" (Guids reais); DM é
 * "dm/{friendId}". Devolve o channelId real, ou null se for DM.
 */
function getRealChannelId(activeId: string): string | null {
  if (activeId.startsWith('dm/')) return null;
  const [, channelId] = activeId.split('/');
  return channelId ?? null;
}

/**
 * activeId de DM é "dm/{friendId}" — friendId é o Guid do outro usuário, não o id da
 * Conversation (esse só existe depois do primeiro GET /api/conversations/{friendId},
 * feito por useDirectMessages). Devolve o friendId, ou null se não for DM.
 */
function getFriendId(activeId: string): string | null {
  return activeId.startsWith('dm/') ? activeId.slice(3) : null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    servers: {},
    serverId: '',
    // Começa no painel de Amigos: servers/channels/conversas chegam de forma
    // assíncrona da API, e não há mais nenhuma DM mock sempre disponível pra abrir de
    // cara — o painel de Amigos não depende de nenhuma dessas buscas.
    scopeKind: 'friends',
    activeId: '',
    draft: '',
    threadKey: null,
    threadDraft: '',
    voiceRoom: null,
    muted: false,
    deafened: false,
    speaking: 'Bruno',
    mobTab: 'conversas',
    mobScreen: 'list',
    convos: {},
    dmContacts: [],
  });

  const realChannelId = getRealChannelId(state.activeId);
  const chat = useChat(realChannelId ?? '');

  const friendId = getFriendId(state.activeId);
  const dm = useDirectMessages(friendId ?? '');

  // Estabelece a conexão SignalR assim que o app carrega (usuário já autenticado —
  // AppProvider só monta depois do AuthGate), independente de qual scope o usuário
  // está navegando. Sem isso, a conexão só abriria via useChat/joinChannel quando um
  // canal real fosse aberto — e como o app começa no painel de Amigos (sem canal nem
  // DM ativos), presença e eventos de amigos poderiam nunca funcionar.
  // ensureConnected() é idempotente (reusa a conexão/promise em andamento), então
  // chamar de novo depois via joinChannel/joinConversation é seguro.
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

  // Busca as conversas de DM existentes ao montar (GET /api/conversations), pra a
  // sidebar de Diretas persistir entre reloads em vez de só mostrar conversas abertas
  // nesta sessão via "Mensagem" (startDirectMessage).
  useEffect(() => {
    let cancelled = false;

    fetchConversations()
      .then((contacts) => {
        if (!cancelled) setState((prev) => ({ ...prev, dmContacts: contacts }));
      })
      .catch((err) => console.error('Falha ao buscar conversas', err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Histórico de mensagens do canal real ativo (REST) — DM tem seu próprio hook
  // (useDirectMessages) que já faz o merge histórico+SignalR, não passa por aqui.
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

  // Mesmo papel do merge de canal acima, mas pra DM: useDirectMessages já funde
  // histórico (REST) + mensagens ao vivo (SignalR) internamente, só precisa ser
  // espelhado em convos[activeId] pro Sidebar/ChatArea lerem do mesmo lugar de sempre.
  useEffect(() => {
    if (!friendId) return;
    setState((prev) => ({
      ...prev,
      convos: { ...prev.convos, [prev.activeId]: dm.messages },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dm.messages, friendId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (realChannelId) {
        setState((prev) => ({ ...prev, draft: '' }));
        chat.sendMessage(trimmed).catch((err) => console.error('Falha ao enviar mensagem', err));
        return;
      }

      if (friendId) {
        setState((prev) => ({ ...prev, draft: '' }));
        dm.sendMessage(trimmed).catch((err) => console.error('Falha ao enviar mensagem direta', err));
      }
    },
    [realChannelId, chat, friendId, dm]
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
    activeDmLoading: friendId ? dm.loading : false,
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

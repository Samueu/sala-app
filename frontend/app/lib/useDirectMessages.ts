'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from '@/app/types';
import { fetchConversation, sendDirectMessage, toDirectMessage } from './conversations';
import { DirectChatMessage, joinConversation, leaveConversation, onReceiveDirectMessage } from './signalr';

interface UseDirectMessagesResult {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Busca (ou cria) a conversa com `friendId`, carrega o histórico via REST e funde com
 * mensagens ao vivo do SignalR — mesmo formato de useChat.ts, mas endereçado por
 * friendId (conhecido na hora, diferente do conversationId, que só existe depois do
 * primeiro round-trip a GET /api/conversations/{friendId}).
 */
export function useDirectMessages(friendId: string): UseDirectMessagesResult {
  const [history, setHistory] = useState<Message[]>([]);
  const [live, setLive] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    conversationIdRef.current = null;
    setConversationId(null);
    setHistory([]);
    setLive([]);

    if (!friendId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchConversation(friendId)
      .then((detail) => {
        if (cancelled) return;
        conversationIdRef.current = detail.conversationId;
        setConversationId(detail.conversationId);
        setHistory(detail.messages);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [friendId]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = onReceiveDirectMessage((message: DirectChatMessage) => {
      if (message.conversationId === conversationIdRef.current) {
        setLive((prev) => [...prev, toDirectMessage(message)]);
      }
    });

    joinConversation(conversationId).catch((err) => {
      console.error(`Falha ao entrar na conversa ${conversationId}`, err);
    });

    return () => {
      unsubscribe();
      leaveConversation(conversationId).catch(() => {
        // Conexão pode já ter caído — sair de uma conversa que não existe mais não é problema.
      });
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !conversationIdRef.current) return;

    try {
      await sendDirectMessage(conversationIdRef.current, trimmed);
      // Não insere localmente: o remetente também está em Clients.Users([...]) no
      // backend, então ReceiveDirectMessage volta pra cá e cai no merge acima — mesmo
      // padrão de useChat.sendMessage pra canais.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return { messages: [...history, ...live], sendMessage, loading, error };
}

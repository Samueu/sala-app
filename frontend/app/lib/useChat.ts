'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  joinChannel,
  leaveChannel,
  onReceiveMessage,
  sendMessage as sendChatMessage,
} from './signalr';

interface UseChatResult {
  messages: ChatMessage[];
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
}

/**
 * Conecta ao ChatHub, entra no grupo do canal e escuta novas mensagens.
 * `channelId` é o Guid real de um Channel do backend — não os ids mock que a UI
 * hoje usa em app/lib/data.ts.
 */
export function useChat(channelId: string): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelIdRef = useRef(channelId);
  channelIdRef.current = channelId;

  useEffect(() => {
    if (!channelId) {
      return;
    }

    let cancelled = false;
    setMessages([]);
    setIsConnected(false);
    setError(null);

    const unsubscribe = onReceiveMessage((message) => {
      if (message.channelId === channelIdRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    });

    joinChannel(channelId)
      .then(() => {
        if (!cancelled) setIsConnected(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
      unsubscribe();
      leaveChannel(channelId).catch(() => {
        // Conexão pode já ter caído — sair de um canal que não existe mais não é problema.
      });
    };
  }, [channelId]);

  const sendMessage = useCallback(
    async (content: string, parentMessageId?: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      try {
        await sendChatMessage(channelId, trimmed, parentMessageId);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [channelId]
  );

  return { messages, sendMessage, isConnected, error };
}

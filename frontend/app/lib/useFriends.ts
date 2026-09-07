'use client';

import { useCallback, useEffect, useState } from 'react';
import { Friend, FriendRequestItem } from '@/app/types';
import {
  acceptFriendRequest,
  fetchFriends,
  fetchPendingReceived,
  fetchPendingSent,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from './friends';
import { onFriendRequestAccepted, onFriendRequestReceived, onFriendStatusChanged } from './signalr';

interface UseFriendsResult {
  friends: Friend[];
  pendingReceived: FriendRequestItem[];
  pendingSent: FriendRequestItem[];
  loading: boolean;
  error: string | null;
  sendRequest: (username: string) => Promise<FriendRequestItem>;
  accept: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
  remove: (friendId: string) => Promise<void>;
  refresh: () => void;
}

/**
 * Dados de amigos + solicitações, com atualização em tempo real via SignalR.
 * Chamado só dentro de FriendsPanel — diferente de useChat (que mora no AppContext
 * porque Sidebar e ChatArea, dois componentes irmãos, precisam dos mesmos dados),
 * aqui só um componente consome, então não precisa subir pro contexto global.
 */
export function useFriends(): UseFriendsResult {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendRequestItem[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const refresh = useCallback(() => setReloadTick((tick) => tick + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([fetchFriends(), fetchPendingReceived(), fetchPendingSent()])
      .then(([friendsList, received, sent]) => {
        if (cancelled) return;
        setFriends(friendsList);
        setPendingReceived(received);
        setPendingSent(sent);
        setError(null);
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
  }, [reloadTick]);

  // Solicitação recebida: aparece na aba Pendentes na hora, sem reload.
  useEffect(
    () =>
      onFriendRequestReceived((request) => {
        setPendingReceived((prev) => (prev.some((r) => r.id === request.id) ? prev : [request, ...prev]));
      }),
    []
  );

  // Solicitação aceita (por qualquer um dos dois lados, inclusive auto-accept mútuo):
  // some das duas listas de pendentes e busca a lista de amigos de novo — o DTO do
  // evento não tem isOnline/friendsSince, não dá pra montar um Friend só com ele.
  useEffect(
    () =>
      onFriendRequestAccepted((request) => {
        setPendingReceived((prev) => prev.filter((r) => r.id !== request.id));
        setPendingSent((prev) => prev.filter((r) => r.id !== request.id));
        refresh();
      }),
    [refresh]
  );

  // Presença de um amigo mudou: update pontual, sem refetch.
  useEffect(
    () =>
      onFriendStatusChanged(({ userId, isOnline }) => {
        setFriends((prev) => prev.map((f) => (f.userId === userId ? { ...f, isOnline } : f)));
      }),
    []
  );

  const sendRequest = useCallback(async (username: string) => {
    const request = await sendFriendRequest(username);
    if (request.status === 'Accepted') {
      // Auto-accept mútuo: o outro já tinha te mandado uma solicitação antes.
      refresh();
    } else {
      setPendingSent((prev) => [request, ...prev]);
    }
    return request;
  }, [refresh]);

  const accept = useCallback(async (id: string) => {
    await acceptFriendRequest(id);
    setPendingReceived((prev) => prev.filter((r) => r.id !== id));
    refresh();
  }, [refresh]);

  const reject = useCallback(async (id: string) => {
    await rejectFriendRequest(id);
    setPendingReceived((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const remove = useCallback(async (friendId: string) => {
    await removeFriend(friendId);
    setFriends((prev) => prev.filter((f) => f.userId !== friendId));
  }, []);

  return { friends, pendingReceived, pendingSent, loading, error, sendRequest, accept, reject, remove, refresh };
}

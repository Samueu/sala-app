'use client';

import { useState } from 'react';
import { useApp } from '@/app/lib/context';
import { useFriends } from '@/app/lib/useFriends';
import { formatDate, initials, tint } from '@/app/lib/data';
import { Friend, FriendRequestItem } from '@/app/types';

type Tab = 'online' | 'todos' | 'pendentes' | 'adicionar';

const TABS: { key: Tab; label: string }[] = [
  { key: 'online', label: 'Online' },
  { key: 'todos', label: 'Todos' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'adicionar', label: 'Adicionar amigo' },
];

function Avatar({ name, isOnline }: { name: string; isOnline?: boolean }) {
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
        style={{ backgroundColor: tint(name) }}
      >
        {initials(name)}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-bg ${
            isOnline ? 'bg-green-400' : 'bg-neutral-600'
          }`}
        ></span>
      )}
    </div>
  );
}

function FriendRow({
  friend,
  onMessage,
  onRemove,
}: {
  friend: Friend;
  onMessage: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-md hover:bg-neutral-900 transition-colors">
      <Avatar name={friend.username} isOnline={friend.isOnline} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-neutral-200 truncate">{friend.username}</div>
        <div className="text-xs text-neutral-600">
          {friend.isOnline ? 'Online' : 'Offline'} · amigos desde {formatDate(friend.friendsSince)}
        </div>
      </div>
      <i
        onClick={onMessage}
        title="Mensagem"
        className="ph ph-chat-circle-text text-base text-neutral-500 hover:text-accent-300 cursor-pointer transition-colors"
      ></i>
      <i
        onClick={onRemove}
        title="Remover amigo"
        className="ph ph-user-minus text-base text-neutral-500 hover:text-red-400 cursor-pointer transition-colors"
      ></i>
    </div>
  );
}

function PendingReceivedRow({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequestItem;
  onAccept: () => void;
  onReject: () => void;
}) {
  const name = request.senderUsername ?? 'Usuário';
  return (
    <div className="flex items-center gap-4 p-3 rounded-md hover:bg-neutral-900 transition-colors">
      <Avatar name={name} />
      <div className="flex-1 min-w-0 text-sm text-neutral-200 truncate">{name}</div>
      <i
        onClick={onAccept}
        title="Aceitar"
        className="ph ph-check text-base text-neutral-500 hover:text-green-400 cursor-pointer transition-colors"
      ></i>
      <i
        onClick={onReject}
        title="Recusar"
        className="ph ph-x text-base text-neutral-500 hover:text-red-400 cursor-pointer transition-colors"
      ></i>
    </div>
  );
}

function PendingSentRow({ request }: { request: FriendRequestItem }) {
  const name = request.receiverUsername ?? 'Usuário';
  return (
    <div className="flex items-center gap-4 p-3 rounded-md">
      <Avatar name={name} />
      <div className="flex-1 min-w-0 text-sm text-neutral-200 truncate">{name}</div>
      <span className="text-xs text-neutral-600">Aguardando</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-3 py-8 text-sm text-neutral-600 text-center">{text}</div>;
}

function AddFriendForm({ onSend }: { onSend: (username: string) => Promise<FriendRequestItem> }) {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const request = await onSend(trimmed);
      setUsername('');
      setSuccess(request.status === 'Accepted' ? 'Vocês agora são amigos!' : 'Solicitação enviada!');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="text-sm text-neutral-400 mb-4">
        Digite o nome de usuário de quem você quer adicionar como amigo.
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome de usuário"
          className="flex-1 min-w-0 h-10 px-3 rounded-md bg-neutral-900 ring-1 ring-inset ring-neutral-800 focus:ring-accent-400 outline-0 text-sm text-text placeholder-neutral-600"
        />
        <button
          type="submit"
          disabled={!username.trim() || submitting}
          className="h-10 px-4 rounded-md bg-accent-800 text-accent-200 text-sm font-500 hover:bg-accent-700 transition-colors disabled:opacity-50"
        >
          Enviar solicitação
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      {success && <p className="mt-3 text-xs text-green-400">{success}</p>}
    </div>
  );
}

export default function FriendsPanel() {
  const app = useApp();
  const { friends, pendingReceived, pendingSent, loading, error, sendRequest, accept, reject, remove } =
    useFriends();
  const [tab, setTab] = useState<Tab>('online');

  const handleMessage = (friend: Friend) => {
    app.startDirectMessage({ id: friend.userId, username: friend.username });
  };

  const handleAccept = (id: string) => {
    accept(id).catch((err) => console.error('Falha ao aceitar solicitação', err));
  };

  const handleReject = (id: string) => {
    reject(id).catch((err) => console.error('Falha ao recusar solicitação', err));
  };

  const handleRemove = (friendId: string) => {
    remove(friendId).catch((err) => console.error('Falha ao remover amigo', err));
  };

  const onlineFriends = friends.filter((f) => f.isOnline);
  const pendingCount = pendingReceived.length;

  return (
    <main className="flex flex-col h-full min-w-0 min-h-0">
      <header className="flex items-center gap-4 px-8 py-6 border-b border-neutral-800">
        <i className="ph ph-users text-base text-neutral-600"></i>
        <span className="font-heading text-base font-500">Amigos</span>
      </header>

      <div className="flex items-center gap-2 px-8 py-4 border-b border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-8 px-3 rounded-md text-sm transition-colors ${
              tab === t.key
                ? 'bg-accent-900 text-accent-200 ring-1 ring-accent-700'
                : 'text-neutral-500 hover:text-neutral-200'
            }`}
          >
            {t.label}
            {t.key === 'pendentes' && pendingCount > 0 && (
              <span className="ml-2 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full text-xs font-bold text-neutral-900 bg-accent-400">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {loading && <div className="text-sm text-neutral-600">Carregando...</div>}
        {error && !loading && <div className="text-sm text-red-400">{error}</div>}

        {!loading && !error && tab === 'online' && (
          <div className="flex flex-col gap-0.5">
            {onlineFriends.length === 0 ? (
              <EmptyState text="Nenhum amigo online agora." />
            ) : (
              onlineFriends.map((f) => (
                <FriendRow
                  key={f.userId}
                  friend={f}
                  onMessage={() => handleMessage(f)}
                  onRemove={() => handleRemove(f.userId)}
                />
              ))
            )}
          </div>
        )}

        {!loading && !error && tab === 'todos' && (
          <div className="flex flex-col gap-0.5">
            {friends.length === 0 ? (
              <EmptyState text="Você ainda não tem amigos por aqui." />
            ) : (
              friends.map((f) => (
                <FriendRow
                  key={f.userId}
                  friend={f}
                  onMessage={() => handleMessage(f)}
                  onRemove={() => handleRemove(f.userId)}
                />
              ))
            )}
          </div>
        )}

        {!loading && !error && tab === 'pendentes' && (
          <div className="flex flex-col gap-8">
            <div>
              <div className="px-3 pb-3 text-xs tracking-widest uppercase text-neutral-600">Recebidas</div>
              <div className="flex flex-col gap-0.5">
                {pendingReceived.length === 0 ? (
                  <EmptyState text="Nenhuma solicitação recebida." />
                ) : (
                  pendingReceived.map((r) => (
                    <PendingReceivedRow
                      key={r.id}
                      request={r}
                      onAccept={() => handleAccept(r.id)}
                      onReject={() => handleReject(r.id)}
                    />
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="px-3 pb-3 text-xs tracking-widest uppercase text-neutral-600">Enviadas</div>
              <div className="flex flex-col gap-0.5">
                {pendingSent.length === 0 ? (
                  <EmptyState text="Nenhuma solicitação enviada." />
                ) : (
                  pendingSent.map((r) => <PendingSentRow key={r.id} request={r} />)
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'adicionar' && <AddFriendForm onSend={sendRequest} />}
      </div>
    </main>
  );
}

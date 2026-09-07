'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/AuthContext';
import { initials, tint } from '@/app/lib/data';
import { UserProfile } from '@/app/types';

interface ProfileModalProps {
  profile: UserProfile | null;
  onUpdate: (patch: { username?: string; avatarUrl?: string }) => Promise<UserProfile>;
  onClose: () => void;
}

export default function ProfileModal({ profile, onUpdate, onClose }: ProfileModalProps) {
  const { signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const startEditing = () => {
    setUsername(profile?.username ?? '');
    setError(null);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onUpdate({ username: trimmed });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Não precisa fechar o modal nem redirecionar manualmente: AuthGate troca pra
      // tela de login sozinho assim que a sessão do Supabase cai (onAuthStateChange).
    } catch (err) {
      setSigningOut(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const displayName = profile?.username ?? 'Você';

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="w-full max-w-sm p-8 rounded-md bg-surface ring-1 ring-inset ring-neutral-800">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-lg font-500 text-neutral-100">Perfil</h1>
          <i
            onClick={onClose}
            className="ph ph-x text-base text-neutral-600 hover:text-neutral-300 cursor-pointer transition-colors"
          ></i>
        </div>

        <div className="flex items-center gap-4 mt-6">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-neutral-900 flex-shrink-0"
              style={{ backgroundColor: tint(displayName) }}
            >
              {initials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-500 text-neutral-100 truncate">{displayName}</div>
            <div className="mt-1 text-xs text-neutral-600">membro do Sala App</div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-600" htmlFor="profile-username">
                Nome de exibição
              </label>
              <input
                id="profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="h-10 px-3 rounded-md bg-neutral-900 text-sm text-neutral-200 ring-1 ring-inset ring-neutral-800 focus:outline-none focus:ring-accent-400"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={submitting}
                className="flex-1 h-10 rounded-md bg-neutral-800 text-neutral-300 text-sm font-500 hover:text-neutral-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!username.trim() || submitting}
                className="flex-1 h-10 rounded-md bg-accent-800 text-accent-200 text-sm font-500 hover:bg-accent-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {error && <p className="mt-6 text-xs text-red-400">{error}</p>}
            <button
              onClick={startEditing}
              className="mt-6 w-full h-10 rounded-md bg-accent-800 text-accent-200 text-sm font-500 hover:bg-accent-700 transition-colors"
            >
              Editar perfil
            </button>
          </>
        )}

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-3 w-full h-10 rounded-md bg-neutral-800 text-neutral-300 text-sm font-500 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {signingOut ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserProfile } from '@/app/types';
import { fetchMe, updateProfile as updateProfileApi } from './users';

interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (patch: { username?: string; avatarUrl?: string }) => Promise<UserProfile>;
}

/**
 * Perfil do usuário autenticado. Chamado uma única vez (em ServerList.tsx, dono do
 * gatilho de perfil) e passado via props pra quem mais precisar — evita fetch
 * duplicado, mesmo espírito de useFriends (mas sem realtime, não precisa disso aqui).
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((p) => {
        if (!cancelled) setProfile(p);
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
  }, []);

  const updateProfile = useCallback(async (patch: { username?: string; avatarUrl?: string }) => {
    const updated = await updateProfileApi(patch);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, updateProfile };
}

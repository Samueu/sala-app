import { UserProfile } from '@/app/types';
import { fetchJson, patchJson } from './api';

export function fetchMe(): Promise<UserProfile> {
  return fetchJson<UserProfile>('/api/users/me');
}

export function updateProfile(patch: { username?: string; avatarUrl?: string }): Promise<UserProfile> {
  return patchJson<UserProfile>('/api/users/me', patch);
}

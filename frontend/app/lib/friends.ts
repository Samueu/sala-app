import { Friend, FriendRequestItem } from '@/app/types';
import { deleteRequest, fetchJson, postJson } from './api';

export function fetchFriends(): Promise<Friend[]> {
  return fetchJson<Friend[]>('/api/friends');
}

export function fetchPendingReceived(): Promise<FriendRequestItem[]> {
  return fetchJson<FriendRequestItem[]>('/api/friends/requests/pending');
}

export function fetchPendingSent(): Promise<FriendRequestItem[]> {
  return fetchJson<FriendRequestItem[]>('/api/friends/requests/sent');
}

export function sendFriendRequest(username: string): Promise<FriendRequestItem> {
  return postJson<FriendRequestItem>('/api/friends/requests', { username });
}

export function acceptFriendRequest(id: string): Promise<FriendRequestItem> {
  return postJson<FriendRequestItem>(`/api/friends/requests/${id}/accept`);
}

export function rejectFriendRequest(id: string): Promise<FriendRequestItem> {
  return postJson<FriendRequestItem>(`/api/friends/requests/${id}/reject`);
}

export function removeFriend(friendId: string): Promise<void> {
  return deleteRequest(`/api/friends/${friendId}`);
}

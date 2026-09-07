export const TINTS: Record<string, string> = {
  Ana: 'var(--color-accent-400)',
  Bruno: 'var(--color-accent-2-400)',
  Caio: 'var(--color-neutral-400)',
  Dora: 'var(--color-accent-300)',
  Elis: 'var(--color-neutral-500)',
  Iago: 'var(--color-accent-2-300)',
  Você: 'var(--color-accent-400)',
};

export const tint = (name: string): string => TINTS[name] || 'var(--color-neutral-500)';

export const initials = (name: string): string => {
  if (name === 'Você') return 'VC';
  return name.trim().slice(0, 2).toUpperCase();
};

export const formatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export const formatDate = (isoDate: string): string => new Date(isoDate).toLocaleDateString('pt-BR');

// Servidores/canais e DMs reais agora vêm da API (app/lib/servers.ts e
// app/lib/conversations.ts, via app.servers/app.dmContacts no contexto) — os mocks
// que existiam aqui (SERVERS, DMS, INITIAL_CONVOS) foram removidos.

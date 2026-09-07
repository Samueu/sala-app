import { DirectMessage } from '@/app/types';

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

// Servidores/canais reais agora vêm da API (app/lib/servers.ts, via app.servers no
// contexto) — SERVERS mock foi removido daqui. DMs continuam mock: o backend não
// tem conceito de mensagem direta hoje.
export const DMS: DirectMessage[] = [
  { id: 'ana', name: 'Ana', unread: 0 },
  { id: 'iago', name: 'Iago', unread: 1 },
  { id: 'dora', name: 'Dora', unread: 0 },
];

export const INITIAL_CONVOS = {
  'dm/ana': [
    { id: '1', name: 'Ana', time: '09:02', text: 'Consegue revisar o convite antes da sexta?' },
    { id: '2', name: 'Você', time: '09:03', text: 'Consigo. Te chamo na voz quando terminar.' },
  ],
  'dm/iago': [{ id: '1', name: 'Iago', time: '10:15', text: 'Te mando o link daqui a pouco.' }],
  'dm/dora': [{ id: '1', name: 'Dora', time: 'ter', text: 'Valeu pela ajuda ontem.' }],
};

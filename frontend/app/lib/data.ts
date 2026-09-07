import { Server, DirectMessage } from '@/app/types';

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

export const SERVERS: Record<string, Server> = {
  jogatina: {
    id: 'jogatina',
    name: 'Jogatina',
    mark: 'JG',
    badge: 2,
    channels: [
      {
        id: 'geral',
        name: 'geral',
        topic: 'o que rolar',
        intro: 'Início de #geral. Combinação de horário, links e conversa solta.',
      },
      {
        id: 'partidas',
        name: 'partidas',
        topic: 'quem entra hoje',
        intro: 'Início de #partidas. Chamadas de jogo e escalação.',
        unread: 2,
      },
      {
        id: 'clipes',
        name: 'clipes',
        topic: 'melhores momentos',
        intro: 'Início de #clipes.',
      },
    ],
    rooms: [
      { id: 'principal', name: 'Sala principal', people: ['Ana', 'Bruno', 'Dora'] },
      { id: 'duo', name: 'Duo', people: ['Caio'] },
      { id: 'ouvindo', name: 'Só ouvindo', people: [] },
    ],
  },
  estudos: {
    id: 'estudos',
    name: 'Grupo de estudos',
    mark: 'GE',
    badge: 0,
    channels: [
      {
        id: 'avisos',
        name: 'avisos',
        topic: 'datas e materiais',
        intro: 'Início de #avisos.',
      },
      {
        id: 'duvidas',
        name: 'duvidas',
        topic: 'pergunte sem medo',
        intro: 'Início de #duvidas.',
      },
    ],
    rooms: [{ id: 'mesa', name: 'Mesa de estudo', people: ['Elis', 'Iago'] }],
  },
};

export const DMS: DirectMessage[] = [
  { id: 'ana', name: 'Ana', unread: 0 },
  { id: 'iago', name: 'Iago', unread: 1 },
  { id: 'dora', name: 'Dora', unread: 0 },
];

export const INITIAL_CONVOS = {
  'jogatina/geral': [
    { id: '1', name: 'Ana', time: '09:12', text: 'Bom dia. Alguém entra na sala principal mais tarde?' },
    { id: '2', name: 'Bruno', time: '09:14', text: 'Eu entro. Depois das sete fico livre.' },
    { id: '3', name: 'Bruno', time: '09:14', text: 'Levo o mapa novo pra gente testar.' },
    {
      id: '4',
      name: 'Dora',
      time: '09:31',
      text: 'Marquei aqui. Se atrasar eu aviso.',
      replies: [
        { id: '4-1', name: 'Ana', time: '09:33', text: 'Sem problema, a gente espera.' },
        { id: '4-2', name: 'Bruno', time: '09:40', text: 'Deixo a sala aberta.' },
      ],
    },
  ],
  'jogatina/partidas': [
    { id: '1', name: 'Caio', time: '08:20', text: 'Time de quatro pra hoje: eu, Bruno, Dora e falta um.' },
    { id: '2', name: 'Iago', time: '08:44', text: 'Fecho o quarto.' },
  ],
  'jogatina/clipes': [
    { id: '1', name: 'Dora', time: 'ontem', text: 'Aquela última rodada rendeu um clipe bom. Subo depois.' },
  ],
  'estudos/avisos': [{ id: '1', name: 'Elis', time: '07:50', text: 'Material da semana está na pasta compartilhada.' }],
  'estudos/duvidas': [
    {
      id: '1',
      name: 'Iago',
      time: '08:05',
      text: 'Alguém entendeu o exercício quatro?',
      replies: [{ id: '1-1', name: 'Elis', time: '08:12', text: 'É o mesmo método da aula passada, só troca a ordem.' }],
    },
  ],
  'dm/ana': [
    { id: '1', name: 'Ana', time: '09:02', text: 'Consegue revisar o convite antes da sexta?' },
    { id: '2', name: 'Você', time: '09:03', text: 'Consigo. Te chamo na voz quando terminar.' },
  ],
  'dm/iago': [{ id: '1', name: 'Iago', time: '10:15', text: 'Te mando o link daqui a pouco.' }],
  'dm/dora': [{ id: '1', name: 'Dora', time: 'ter', text: 'Valeu pela ajuda ontem.' }],
};

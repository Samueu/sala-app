# Sala - Discord-like Chat App

Um aplicativo de chat inspirado no Discord, construído com Next.js, React, TypeScript e Tailwind CSS.

## 🎯 Features

- **Layout responsivo** - Ajusta-se entre desktop e mobile
- **Múltiplos servidores** - Troque entre diferentes servidores
- **Canais** - Organize conversas por canais
- **Mensagens diretas** - Converse diretamente com pessoas
- **Threads** - Organize discussões em threads
- **Salas de voz** - Visualize e controle salas de voz
- **Design Nocturne** - Design system dark moderno
- **Reativo** - Interface completamente reativa com React hooks

## 🚀 Getting Started

### Requisitos
- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Fazer build para produção
npm run build

# Iniciar servidor de produção
npm start
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
sala-app/
├── app/
│   ├── components/           # Componentes React
│   │   ├── ServerList.tsx     # Sidebar com lista de servidores
│   │   ├── Sidebar.tsx        # Sidebar com canais
│   │   ├── ChatArea.tsx       # Área principal de chat
│   │   ├── ThreadPanel.tsx    # Painel de threads
│   │   ├── VoicePanel.tsx     # Painel de voz (mock)
│   │   ├── VoiceChannel.tsx   # Sala de voz real (LiveKit) — autocontido, não ligado ao mock
│   │   ├── AuthScreen.tsx     # Tela de login/registro (e-mail + senha)
│   │   └── AuthGate.tsx       # Mostra AuthScreen sem sessão, o app com sessão
│   ├── lib/
│   │   ├── context.tsx        # Estado global: servidores/canais/mensagens reais + DMs mock
│   │   ├── data.ts            # DMs mock, TINTS/tint/initials/formatTime (SERVERS não é mais mock)
│   │   ├── servers.ts         # Busca servidores/canais/mensagens reais na API e mapeia pros tipos da UI
│   │   ├── api.ts             # fetchJson: GET autenticado genérico no backend
│   │   ├── config.ts          # API_BASE_URL do backend
│   │   ├── auth.ts            # setAccessTokenProvider/getAccessToken (alimentado pelo AuthContext)
│   │   ├── supabaseClient.ts  # Client Supabase (browser only)
│   │   ├── AuthContext.tsx    # AuthProvider/useAuth — sessão, user, accessToken, signIn/signUp/signOut
│   │   ├── signalr.ts         # Client SignalR (conexão com o ChatHub do backend)
│   │   ├── useChat.ts         # Hook: entra num canal e escuta/envia mensagens em tempo real
│   │   └── voice.ts           # Busca o token de voz (GET /api/voice/token) no backend
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Página principal
├── public/                    # Arquivos estáticos
├── tailwind.config.js         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
└── package.json               # Dependências e scripts
```

## 🎨 Design System - Nocturne

O projeto utiliza o design system **Nocturne** com paleta de cores dark:

- **Background**: #161826
- **Surface**: #232532
- **Text**: #e9e9ed
- **Accent**: #9184d9
- **Neutral ramp**: Escala de cores neutras

### Componentes disponíveis
- Buttons (Primary, Secondary, Ghost, Icon)
- Forms (Input, Radio, Select)
- Cards
- Tags
- Navigation
- Tables
- Dialogs

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Utility-first CSS
- **Phosphor Icons** - Ícones SVG

## 📊 Dados

- **Servidores, canais e mensagens**: reais, vindos do backend (`GET /api/servers`,
  `GET /api/servers/{id}/channels`, `GET /api/channels/{id}/messages` + `ChatHub` via SignalR pra
  tempo real). Só aparecem servidores em que o usuário logado é membro — não existe UI de
  criar/entrar em servidor ainda, então pra testar é preciso inserir uma linha `Server` +
  `ServerMember` direto no Postgres pro usuário de teste.
- **Mensagens diretas** (Ana, Iago, Dora) e **badges de não-lido**: continuam mock
  (`app/lib/data.ts`) — o backend não tem esses conceitos ainda.
- **Salas de voz** (lista de "quem está na sala" antes de entrar): mock/vazio pros servidores reais —
  ver `app/components/VoiceChannel.tsx` pra sala de voz de verdade (LiveKit), que mostra participantes
  reais depois que você entra.

## 💡 Como Usar

1. **Trocar de servidor** - Clique em um dos ícones na primeira coluna
2. **Abrir canal/DM** - Clique na lista de canais
3. **Enviar mensagem** - Digite na caixa de texto no final do chat
4. **Abrir thread** - Clique em uma mensagem com respostas
5. **Entrar em voz** - Clique em uma sala de voz no painel direito
6. **Mutarr microfone/áudio** - Use os botões de controle na seção de voz

## 📱 Responsividade

A aplicação é responsiva:
- **Desktop** (>1024px) - Layout com 4+ colunas
- **Mobile** (<1024px) - Layout adaptado (em desenvolvimento)

## 🔧 Customização

### Adicionar novo servidor
Servidores agora vêm da API — crie via `POST /api/servers` (autenticado) no backend, não editando
`data.ts`. Pra adicionar uma DM mock, edite `DMS`/`INITIAL_CONVOS` em `app/lib/data.ts`.

### Customizar cores
Edite o arquivo `tailwind.config.js` para alterar o design system.

### Adicionar novo componente
1. Crie um novo arquivo em `app/components/`
2. Importe em `app/page.tsx`
3. Integre no layout

## 🔌 Chat em tempo real (SignalR)

`app/lib/signalr.ts` conecta no `ChatHub` do backend (`backend/Hubs/ChatHub.cs`) e `app/lib/useChat.ts`
expõe isso como hook React. Isso é independente da UI mock atual (`data.ts`/`context.tsx`) — usa o Guid
real de um `Channel` do backend, não os ids mock tipo `"jogatina/geral"`.

```tsx
const { messages, sendMessage, isConnected, error } = useChat(channelId); // channelId = Guid real
```

Configuração:

- `NEXT_PUBLIC_API_BASE_URL` (opcional, default `http://localhost:5289`) — URL do backend. Crie um
  `.env.local` (veja `.env.local.example`) se ele rodar em outro host/porta.
- **Autenticação**: o `ChatHub` exige o JWT do Supabase Auth (`[Authorize]`) — já vem sozinho, via
  `AuthProvider` (`app/lib/AuthContext.tsx`), que registra o token real assim que o usuário loga (ver
  seção "Autenticação" abaixo). Sem login, a conexão autentica com token vazio e o backend responde 401
  (esperado, não é bug).

## 🎙️ Voz em tempo real (LiveKit)

`app/components/VoiceChannel.tsx` conecta na sala de voz LiveKit de um canal — o token vem de
`GET /api/voice/token` no backend (`backend/Controllers/VoiceController.cs`), via `app/lib/voice.ts`.
Assim como o `useChat`, é autocontido e independente da UI mock (`VoicePanel.tsx`); usa o Guid real de um
`Channel`, e a mesma extensão de autenticação (`setAccessTokenProvider`) do SignalR.

```tsx
<VoiceChannel channelId={channelId} /> // channelId = Guid real do Channel
```

Usa os hooks headless do `@livekit/components-react` (`useParticipants`, `useLocalParticipant`,
`RoomAudioRenderer`) com UI própria em Tailwind — não os componentes pré-estilizados da lib, pra manter o
visual "Nocturne" do resto do app (mesmo estilo de avatar/destaque de `VoicePanel.tsx`).

## 🔐 Autenticação (Supabase Auth)

`app/lib/supabaseClient.ts` cria o client Supabase (browser only, sem `@supabase/ssr`/`middleware.ts` —
o app é 100% client-rendered, então não precisa da complexidade de sessão via cookie/SSR). Configure em
`.env.local` (veja `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>   # Project Settings -> API Keys
```

`app/lib/AuthContext.tsx` expõe `useAuth()` — `{ user, session, accessToken, loading, signIn, signUp,
signOut }` — e registra o token de sessão automaticamente em `app/lib/auth.ts`
(`setAccessTokenProvider`), então `useChat`/`VoiceChannel`/`fetchVoiceToken` já autenticam sozinhos
depois do login, sem nenhuma chamada manual. `app/components/AuthScreen.tsx` (login/registro por
e-mail+senha) fica na frente do app inteiro via `app/components/AuthGate.tsx`, plugado no
`app/layout.tsx` — sem sessão, só a tela de login aparece.

Sem OAuth social, recuperação de senha ou confirmação de e-mail customizada por enquanto — só
e-mail/senha, usando o fluxo padrão do Supabase Auth (se o projeto exigir confirmação de e-mail, o
cadastro mostra um aviso pra conferir a caixa de entrada).

## 📝 Notas

- Servidores/canais/mensagens são reais e persistem no Postgres (via backend); DMs e badges de
  não-lido continuam mock/fictícios (sem equivalente no backend ainda)
- Salas de voz: a lista de participantes antes de entrar é mock (sem presença via REST ainda), mas
  `VoiceChannel.tsx` conecta numa sala LiveKit real com participantes reais
- Mobile view ainda está em desenvolvimento

## 📄 Licença

Projeto criado para fins educacionais.

## 👤 Autor

Desenvolvido como demonstração de arquitetura Next.js + Design System.

---

**Enjoy chatting! 🎉**

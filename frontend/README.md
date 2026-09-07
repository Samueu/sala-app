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
│   │   └── VoiceChannel.tsx   # Sala de voz real (LiveKit) — autocontido, não ligado ao mock
│   ├── lib/
│   │   ├── context.tsx        # Context React para estado global
│   │   ├── data.ts            # Dados iniciais (servidores, canais, etc)
│   │   ├── config.ts          # API_BASE_URL do backend
│   │   ├── auth.ts            # Ponto de extensão pro token de acesso (Supabase, ainda não ligado)
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

O aplicativo vem pré-carregado com dados de exemplo:

### Servidores
- **Jogatina** (JG) - Servidor de jogos com canais de geral, partidas e clipes
- **Grupo de estudos** (GE) - Servidor de estudos com canais de avisos e dúvidas

### Mensagens Diretas
- Ana, Iago, Dora

### Salas de Voz
- Sala principal, Duo, Só ouvindo, Mesa de estudo

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
Edite `app/lib/data.ts` e adicione um novo servidor ao objeto `SERVERS`.

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
  `.env.local` se ele rodar em outro host/porta.
- **Autenticação**: o `ChatHub` exige o JWT do Supabase Auth (`[Authorize]`), mas o frontend ainda não
  tem um client Supabase configurado. Até isso existir, chame
  `setAccessTokenProvider(() => Promise<string | null>)` (exportado de `app/lib/signalr.ts`) com a função
  que devolve o `access_token` real assim que a autenticação for integrada — sem isso, a conexão
  autentica com token vazio e o backend responde 401 (esperado, não é bug).

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

## 📝 Notas

- Este é um projeto de demonstração com dados fictícios
- As mensagens não são persistidas (são resetadas ao recarregar) — exceto via `useChat`, que fala com o
  backend/Postgres de verdade, mas ainda não está ligado à UI de chat existente
- A funcionalidade de voz é apenas visual neste MVP
- Mobile view ainda está em desenvolvimento

## 📄 Licença

Projeto criado para fins educacionais.

## 👤 Autor

Desenvolvido como demonstração de arquitetura Next.js + Design System.

---

**Enjoy chatting! 🎉**

# SalaApp.Api

Backend em ASP.NET Core Web API para o Sala App, em camadas (`Controllers` → `Services` →
`Repositories`), usando EF Core + Npgsql para conectar no Postgres do Supabase.

> **Nota sobre versão do .NET:** o projeto está em `net10.0`, não `net8.0`. A máquina onde este
> projeto foi criado só tinha o SDK/runtime .NET 10 instalado; foi uma escolha deliberada usar o que já
> estava disponível em vez de instalar o SDK 8 à parte. Se quiser voltar para `net8.0`, instale o SDK 8
> e ajuste `<TargetFramework>` em `SalaApp.Api.csproj`.

## Estrutura

```
Controllers/   # endpoints HTTP (ASP.NET Core MVC controllers)
Services/      # regra de negócio, hoje é passthrough para o repository
Repositories/  # acesso a dados via EF Core
Models/        # entidades de domínio
Data/          # AppDbContext
Migrations/    # histórico de schema do EF Core
```

A entidade `Server` (em `Models/Server.cs`) é o exemplo de ponta a ponta — use-a como modelo para
adicionar `Channel`, `Message`, etc.

## Configurar a conexão com o Supabase

O `appsettings.json` deixa `ConnectionStrings:Default` vazio de propósito — **não** commite a senha
real do banco. Configure localmente com [user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets):

```bash
cd backend
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" \
  "Host=db.<PROJECT_REF>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<SENHA>;SSL Mode=Require;Trust Server Certificate=true"
```

A string de conexão (host, usuário, senha) fica no painel do Supabase em
**Project Settings → Database → Connection string → .NET/Npgsql**.

Em produção, defina a mesma chave via variável de ambiente `ConnectionStrings__Default` (dois
underscores), sem precisar de user-secrets.

## Autenticação (Supabase Auth)

O backend **não** tem login/registro próprios — quem cuida disso é o Supabase Auth, no frontend. Aqui a
API só **valida** o JWT que o Supabase já emitiu (via JWKS do projeto) e, na primeira requisição
autenticada de cada usuário, cria/atualiza automaticamente o perfil leve na tabela `Users` a partir das
claims do token (`SupabaseUserProvisioningMiddleware`).

Pra funcionar, preencha `Supabase:Url` com a URL do seu projeto (não é segredo, mas fica vazia por
padrão) — está em **Project Settings → API → Project URL** no painel do Supabase:

```bash
# appsettings.Development.json, ou:
dotnet user-secrets set "Supabase:Url" "https://<project-ref>.supabase.co"
```

Rotas com `[Authorize]` (hoje: tudo em `ServersController`/`ChannelsController`/`MessagesController`,
`GET /api/users/me`, o `ChatHub`, `GET /api/voice/token` e `POST /api/attachments`) exigem
`Authorization: Bearer <token>`, onde `<token>` é o `access_token` de uma sessão logada no frontend
(`supabase.auth.getSession()`). Sem `Supabase:Url` configurado, ou com um token inválido/expirado, a API
responde `401 Unauthorized`.

## Servidores, canais e mensagens (REST)

- `GET /api/servers` — só os servidores em que o usuário autenticado é `ServerMember` (não todos os do
  banco). `POST /api/servers` cria o servidor com o dono vindo do token (não do corpo) e já insere a
  membership do dono (`Role=Owner`) — sem isso ele não apareceria no próprio `GET /api/servers` depois.
- `GET /api/servers/{id}/channels` — canais de um servidor; `404` se o servidor não existe ou o usuário
  não é membro.
- `GET /api/channels/{id}/messages` — histórico do canal (últimas 50 mensagens-raiz + todas as respostas
  delas, mais antiga primeiro, mesmo formato do `MessageDto` usado no `ChatHub`); mesma regra de acesso
  (membership) das outras rotas de canal. Sem paginação por enquanto.

Não existe endpoint pra criar canal ou entrar num servidor (convite/join) ainda — pra testar de ponta a
ponta, insira manualmente uma linha `ServerMember` no Postgres pro usuário de teste.

## Chat em tempo real (SignalR)

`Hubs/ChatHub.cs` fica em `/hubs/chat` e exige o mesmo JWT do Supabase (o WebSocket manda o token via
query string `access_token`, já que o navegador não permite header `Authorization` no handshake —
configure o cliente com `accessTokenFactory`, não com `Authorization` manual):

```js
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5289/hubs/chat", { accessTokenFactory: () => token })
  .build();

await connection.start();
await connection.invoke("JoinChannel", channelId);
connection.on("ReceiveMessage", (msg) => console.log(msg));
await connection.invoke("SendMessage", channelId, "oi", null);
await connection.invoke("LeaveChannel", channelId);
```

`JoinChannel` e `SendMessage` só funcionam se o usuário autenticado for membro (`ServerMember`) do
servidor dono do canal — senão o Hub lança `HubException`. Cada mensagem é gravada em `Messages` antes de
ser distribuída (evento `ReceiveMessage`) pra todo mundo no grupo `channel:{channelId}`.

## Voz (LiveKit)

`GET /api/voice/token?channelId={guid}` gera um token de acesso do LiveKit pro usuário autenticado entrar
na sala de voz correspondente àquele canal (mesma regra de acesso do `ChatHub`: precisa ser membro do
servidor dono do canal, senão `404`). Resposta:

```json
{ "token": "<jwt do livekit>", "url": "wss://<seu-projeto>.livekit.cloud", "roomName": "<channelId>" }
```

Configure as credenciais do LiveKit (painel do projeto, em **Settings → Keys**):

```bash
dotnet user-secrets set "LiveKit:ApiKey" "<sua api key>"
dotnet user-secrets set "LiveKit:ApiSecret" "<seu api secret>"
```

`LiveKit:Url` não é segredo — preencha no `appsettings.Development.json` (ou user-secrets também, se
preferir) com a URL `wss://` do seu projeto/servidor LiveKit.

## Anexos (Supabase Storage)

`POST /api/attachments?channelId={guid}` (multipart/form-data, campo `file`, limite de 25 MB) sobe o
arquivo pro Supabase Storage e devolve a URL pública — mesma regra de acesso do `ChatHub`/`VoiceController`
(precisa ser membro do servidor dono do canal, senão `404`). Não persiste nada em `Message`; o cliente
decide como usar a URL devolvida:

```json
{ "url": "https://<projeto>.supabase.co/storage/v1/object/public/attachments/<channelId>/<guid>.png",
  "fileName": "foto.png", "sizeBytes": 12345, "contentType": "image/png" }
```

Antes de usar, crie o bucket no painel do Supabase (**Storage → New bucket**), com o nome de
`Supabase:StorageBucket` (default `attachments`), **marcado como público** — sem isso a URL devolvida não
é acessível. Configure a service role key (**Settings → API → service_role**, segredo, nunca exponha no
frontend):

```bash
dotnet user-secrets set "Supabase:ServiceRoleKey" "<sua service role key>"
```

## Rodando localmente

```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

A API sobe com Swagger UI em `/swagger` (ambiente Development). O CORS já está liberado para
`http://localhost:3000` (o frontend em `frontend/`).

## Migrations (EF Core)

O projeto usa um tool manifest local (`.config/dotnet-tools.json`) para o `dotnet-ef`. Primeira vez,
rode `dotnet tool restore`.

```bash
# criar uma nova migration depois de mudar as entidades
dotnet ef migrations add NomeDaMigration

# aplicar as migrations pendentes no Postgres do Supabase
# (precisa da connection string real configurada via user-secrets, ver acima)
dotnet ef database update
```

A migration `InitialCreate` já está no repositório, criando a tabela `Servers`.

## Deploy (Fly.io)

`Dockerfile` (build multi-stage, SDK pra compilar + runtime `aspnet:10.0` só pra rodar) e `fly.toml` já
estão prontos. Duas coisas que só existem por causa do deploy atrás do proxy do Fly:

- Não tem `UseHttpsRedirection()` — o Fly termina TLS na borda e sempre encaminha pro container como
  HTTP puro; com esse middleware ligado, toda requisição entraria em loop de redirect. O `force_https =
  true` do `fly.toml` já cobre HTTPS pros clientes externos.
- `GET /health` é público (sem `[Authorize]`) — é a única rota anônima em Production (Swagger só é
  mapeado em Development), usada pelo health check do `fly.toml`.

A origem do CORS agora vem de `Frontend:Origin` (default `http://localhost:3000`) — configure com o
domínio real do frontend quando ele for hospedado.

```bash
# build local pra conferir antes de mandar pro Fly
docker build -t sala-app-api .
docker run -p 8080:8080 sala-app-api
curl http://localhost:8080/health   # 200 ok

# primeira vez: criar o app no Fly (ajuste o nome em fly.toml antes, se quiser)
fly apps create sala-app-api

# segredos (nunca vão pro fly.toml/appsettings.json)
fly secrets set \
  ConnectionStrings__Default="Host=...;Port=5432;Database=postgres;Username=postgres;Password=...;SSL Mode=Require;Trust Server Certificate=true" \
  Supabase__Url="https://<project-ref>.supabase.co" \
  Supabase__ServiceRoleKey="<service role key>" \
  LiveKit__Url="wss://<seu-projeto>.livekit.cloud" \
  LiveKit__ApiKey="<api key>" \
  LiveKit__ApiSecret="<api secret>" \
  Frontend__Origin="https://<domínio do frontend em produção>"

fly deploy
curl https://<app>.fly.dev/health   # 200
```

Migrations continuam manuais (não rodam sozinhas no start do container): `fly ssh console` +
`dotnet ef database update`, ou local mesmo, apontando pra connection string real do Supabase.

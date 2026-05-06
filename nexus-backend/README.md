# NEXUS Backend

Backend da plataforma NEXUS — workspace colaborativo com chat em tempo real, kanban boards, arquivos, times e permissões, chamadas de voz/vídeo.

**Stack:** Fastify + TypeScript + PostgreSQL + Prisma + Socket.io + LiveKit + Cloudflare R2

## Pré-requisitos

- **Node.js** 22+ ou **Bun** 1.1+
- **Docker** + Docker Compose (para PostgreSQL e Redis local)
- **Conta Cloudflare R2** (para upload de arquivos — opcional em dev)
- **Conta LiveKit Cloud** (para voz/vídeo — opcional em dev)

## Quick Start

```bash
# 1. Subir dependências (PostgreSQL + Redis)
docker compose up -d

# 2. Instalar dependências
bun install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env conforme necessário (pelo menos DATABASE_URL, JWT_SECRET)

# 4. Rodar migrations e seed
bun run migrate:dev --name init
bun run seed

# 5. Iniciar servidor em modo dev
bun run dev
```

Servidor disponível em `http://localhost:3000`
Documentação Swagger em `http://localhost:3000/docs`

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://nexus:nexus@localhost:5432/nexus` |
| `REDIS_URL` | URL do Redis (socket adapter) | `redis://localhost:6379` |
| `JWT_SECRET` | Chave secreta JWT (min 32 chars) | — |
| `JWT_ACCESS_TTL` | TTL do access token | `15m` |
| `JWT_REFRESH_TTL` | TTL do refresh token | `7d` |
| `PORT` | Porta do servidor | `3000` |
| `HOST` | Host do servidor | `0.0.0.0` |
| `CORS_ORIGIN` | Origem permitida CORS | `http://localhost:5173` |
| `NODE_ENV` | Ambiente | `development` |
| `R2_ENDPOINT` | Endpoint do Cloudflare R2 | — |
| `R2_ACCESS_KEY_ID` | Access Key ID R2 | — |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key R2 | — |
| `R2_BUCKET` | Nome do bucket R2 | `nexus-uploads` |
| `LIVEKIT_API_KEY` | API Key LiveKit | — |
| `LIVEKIT_API_SECRET` | API Secret LiveKit | — |
| `LIVEKIT_URL` | URL do servidor LiveKit | — |

## Scripts

| Comando | Descrição |
|---|---|
| `bun run dev` | Inicia servidor em modo dev com hot-reload |
| `bun run build` | Compila TypeScript para `dist/` |
| `bun run start` | Inicia servidor em produção |
| `bun run typecheck` | Verifica tipos TypeScript |
| `bun run migrate:dev` | Cria/executa migrations de desenvolvimento |
| `bun run migrate:deploy` | Executa migrations em produção |
| `bun run seed` | Popula banco com dados de exemplo |
| `bun run studio` | Abre Prisma Studio |
| `bun run generate` | Gera Prisma Client |
| `docker compose up -d` | Sobe PostgreSQL + Redis |

## Estrutura de Diretórios

```
nexus-backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco (22 models)
│   └── seed.ts                # Seed com dados mock
├── src/
│   ├── config/
│   │   ├── env.ts             # Validação de env vars com Zod
│   │   └── constants.ts       # Constantes globais
│   ├── lib/
│   │   ├── errors.ts          # AppError hierarchy
│   │   ├── password.ts        # bcrypt hash/verify
│   │   └── pagination.ts      # Cursor-based pagination
│   ├── plugins/
│   │   ├── prisma.ts          # Prisma client plugin
│   │   ├── auth.ts            # JWT sign/verify plugin
│   │   ├── socket.ts          # Socket.io server plugin
│   │   ├── r2.ts              # Cloudflare R2 plugin
│   │   └── livekit.ts         # LiveKit token plugin
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT Bearer verification
│   │   └── authorize.ts       # Role/permission guards
│   ├── modules/
│   │   ├── auth/              # Registro, login, refresh, perfil
│   │   ├── workspaces/        # CRUD workspaces + members
│   │   ├── channels/          # CRUD canais + auto-columns
│   │   ├── messages/          # Mensagens + reactions + sockets
│   │   ├── boards/            # Kanban columns/cards + sockets
│   │   ├── teams/             # Equipes + permissões
│   │   ├── files/             # Upload R2 + árvore + signed URLs
│   │   ├── voice/             # LiveKit tokens + sessões
│   │   ├── presence/          # Online status via socket
│   │   └── activities/        # Log de atividades
│   ├── types/index.ts         # Tipos compartilhados
│   ├── app.ts                 # Bootstrap Fastify + plugins + rotas
│   ├── server.ts              # Entry point
│   └── socket-handlers.ts     # Socket.io auth + room management
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # PostgreSQL + Redis
├── package.json
└── tsconfig.json
```

## API REST

### Autenticação
- `POST /api/auth/register` — Criar conta
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Rotacionar refresh token
- `GET /api/auth/me` — Perfil do usuário logado
- `PUT /api/auth/status` — Atualizar status (online/busy/away/dnd)

### Workspaces
- `GET /api/workspaces` — Listar workspaces do usuário
- `POST /api/workspaces` — Criar workspace
- `GET /api/workspaces/:id` — Detalhe do workspace
- `PATCH /api/workspaces/:id` — Atualizar workspace
- `DELETE /api/workspaces/:id` — Deletar workspace (owner only)
- `POST /api/workspaces/:id/members` — Convidar membro
- `DELETE /api/workspaces/:id/members/:userId` — Remover membro

### Canais
- `GET /api/workspaces/:wid/channels` — Listar canais
- `POST /api/workspaces/:wid/channels` — Criar canal (board auto-cria colunas)
- `GET /api/channels/:cid` — Detalhe do canal
- `PATCH /api/channels/:cid` — Atualizar canal
- `DELETE /api/channels/:cid` — Deletar canal

### Mensagens
- `GET /api/channels/:cid/messages` — Listar (cursor pagination, 50/page)
- `POST /api/channels/:cid/messages` — Criar mensagem
- `PATCH /api/messages/:mid` — Editar (própria)
- `DELETE /api/messages/:mid` — Deletar (própria)
- `POST /api/messages/:mid/reactions` — Toggle reaction

### Boards (Kanban)
- `GET /api/channels/:cid/columns` — Listar colunas
- `POST /api/channels/:cid/columns` — Criar coluna
- `PATCH /api/columns/:colId` — Atualizar coluna
- `DELETE /api/columns/:colId` — Deletar coluna (se vazia)
- `GET /api/channels/:cid/cards` — Listar cards organizados por coluna
- `POST /api/columns/:colId/cards` — Criar card
- `GET /api/cards/:cardId` — Detalhe do card (com subtasks, comments, assignees)
- `PATCH /api/cards/:cardId` — Atualizar card
- `PATCH /api/cards/:cardId/move` — Mover card entre colunas
- `DELETE /api/cards/:cardId` — Deletar card
- `POST /api/cards/:cid/labels` — Adicionar label
- `POST /api/cards/:cid/assignees` — Adicionar assignee
- `GET /api/cards/:cid/subtasks` — Listar subtasks
- `POST /api/cards/:cid/subtasks` — Criar subtask
- `PATCH /api/subtasks/:sid` — Atualizar subtask
- `GET /api/cards/:cid/comments` — Listar comentários
- `POST /api/cards/:cid/comments` — Criar comentário

### Times e Permissões
- `GET /api/workspaces/:wid/teams` — Listar times
- `POST /api/workspaces/:wid/teams` — Criar time
- `GET /api/teams/:tid` — Detalhe do time
- `PATCH /api/teams/:tid` — Atualizar time
- `DELETE /api/teams/:tid` — Deletar time
- `POST /api/teams/:tid/members` — Adicionar membro
- `DELETE /api/teams/:tid/members/:uid` — Remover membro
- `POST /api/teams/:tid/permissions` — Definir permissão
- `GET /api/permissions/resolve?resourceId=...` — Resolver permissão do usuário

### Arquivos (R2)
- `GET /api/workspaces/:wid/files` — Listar arquivos/pastas
- `GET /api/workspaces/:wid/files/tree` — Árvore completa
- `POST /api/workspaces/:wid/files/folder` — Criar pasta
- `POST /api/workspaces/:wid/files/upload` — Upload de arquivo (multipart)
- `GET /api/files/:fid` — Info do arquivo com signed URL
- `GET /api/files/:fid/download` — Redirect para signed URL
- `POST /api/files/:fid/teams` — Associar times ao arquivo
- `DELETE /api/files/:fid` — Deletar arquivo

### Voz/Vídeo (LiveKit)
- `GET /api/channels/:cid/voice/session` — Sessão ativa
- `POST /api/channels/:cid/voice/join` — Entrar na sala
- `POST /api/channels/:cid/voice/leave` — Sair da sala
- `PATCH /api/channels/:cid/voice/participant` — Atualizar mute/camera/share
- `POST /api/channels/:cid/voice/token` — Gerar token LiveKit

### Webhooks
- `POST /api/webhooks/livekit` — Webhook do LiveKit

### Meta
- `GET /api/health` — Health check
- `GET /api/version` — Versão da API

## Eventos Socket.io

### Subscrição de rooms
- `subscribe:workspace` — Entrar em room `workspace:{id}`
- `unsubscribe:workspace` — Sair
- `subscribe:channel` — Entrar em room `channel:{id}`
- `unsubscribe:channel` — Sair

### Chat
- `chat:send` → broadcast `chat:message`
- `chat:update` → broadcast `chat:updated`
- `chat:delete` → broadcast `chat:deleted`
- `chat:reaction:toggle` → broadcast `chat:reactions`

### Board
- `board:card:create` → broadcast `board:card:created`
- `board:card:update` → broadcast `board:card:updated`
- `board:card:move` → broadcast `board:card:moved`
- `board:card:delete` → broadcast `board:card:deleted`
- `board:column:create/update/delete` → broadcast correspondente

### Presença
- `presence:online` — Usuário ficou online
- `presence:offline` — Usuário ficou offline
- `presence:status` — Mudança de status

### Voz
- `voice:join` → broadcast `voice:participant:joined`
- `voice:leave` → broadcast `voice:participant:left`
- `voice:update` → broadcast `voice:participant:changed`
- `voice:speaking` — Speaker ativo (via webhook)

## Deploy (Railway)

1. Conecte o repositório ao Railway
2. Adicione o plugin PostgreSQL
3. Configure as variáveis de ambiente no dashboard
4. Execute `bun run migrate:deploy` no Railway
5. Execute `bun run seed` opcionalmente
6. O deploy automático acontece via `railway.json`

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "bun run start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Fastify API │────▶│  PostgreSQL  │
│   (Tauri)    │     │  :3000       │     │  (Prisma)    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    │
       │ WebSocket          │ REST               │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Socket.io   │◀───▶│   Redis      │     │ Cloudflare   │
│  :3000       │     │   Adapter    │     │ R2 (Files)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  LiveKit     │
│  Cloud       │
│  (Voice/Video)│
└──────────────┘
```
